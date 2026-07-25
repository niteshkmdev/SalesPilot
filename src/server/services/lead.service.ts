import { prisma } from "@/server/db/prisma";
import type {
  CreateLeadDto,
  LeadListFilters,
  UpdateLeadDto,
} from "../dto/lead.dto";
import {
  toLeadDetailDto,
  toLeadListItemDto,
  toSourceDto,
  toStatusDto,
} from "../dto/lead.mapper";
import { LeadRepository } from "../repositories/lead.repository";

export class LeadService {
  private leadRepo = new LeadRepository();

  private async requireOrganizationMember(
    userId: string,
    organizationId: string,
  ) {
    const member = await prisma.organizationMember.findFirst({
      where: { userId, organizationId },
      include: { role: true },
    });
    if (!member) throw new Error("Unauthorized to access organization");
    return member;
  }

  async createLead(
    userId: string,
    organizationId: string,
    data: CreateLeadDto,
  ) {
    const member = await this.requireOrganizationMember(userId, organizationId);

    if (!data.statusId) {
      const defaultStatus =
        await this.leadRepo.getDefaultStatus(organizationId);
      if (defaultStatus) {
        data.statusId = defaultStatus.id;
      } else {
        throw new Error("No default status found and no status provided.");
      }
    }

    return this.leadRepo.create(organizationId, member.id, data);
  }

  async updateLead(
    userId: string,
    organizationId: string,
    leadId: string,
    data: UpdateLeadDto,
  ) {
    const member = await this.requireOrganizationMember(userId, organizationId);

    const lead = await this.leadRepo.findById(leadId, organizationId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const role = member.role?.name || (member.isOwner ? "Owner" : "Member");

    if (role === "Member") {
      if (lead.assignedMemberId !== member.id && lead.createdBy !== member.id) {
        throw new Error("Unauthorized to edit this lead");
      }
    }

    return this.leadRepo.update(leadId, member.id, data);
  }

  async getLead(userId: string, organizationId: string, leadId: string) {
    await this.requireOrganizationMember(userId, organizationId);

    const lead = await this.leadRepo.findById(leadId, organizationId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    return toLeadDetailDto(lead);
  }

  async getLeads(
    userId: string,
    organizationId: string,
    filters?: LeadListFilters,
  ) {
    await this.requireOrganizationMember(userId, organizationId);

    const where = this.leadRepo.buildListWhere(filters);
    const leads = await this.leadRepo.findMany(organizationId, { where });
    const count = await this.leadRepo.count(organizationId, where);

    return {
      leads: leads.map(toLeadListItemDto),
      count,
    };
  }

  async deleteLead(userId: string, organizationId: string, leadId: string) {
    const member = await this.requireOrganizationMember(userId, organizationId);

    const role = member.role?.name || (member.isOwner ? "Owner" : "Member");
    if (role !== "Owner" && role !== "Admin") {
      throw new Error("Only Owners and Admins can delete leads.");
    }

    return this.leadRepo.softDelete(leadId, member.id);
  }

  async getStatuses(userId: string, organizationId: string) {
    await this.requireOrganizationMember(userId, organizationId);
    const statuses = await this.leadRepo.getStatuses(organizationId);
    return statuses.flatMap((status) => {
      const dto = toStatusDto(status);
      return dto ? [dto] : [];
    });
  }

  async getSources(userId: string, organizationId: string) {
    await this.requireOrganizationMember(userId, organizationId);
    const sources = await this.leadRepo.getSources(organizationId);
    return sources.flatMap((source) => {
      const dto = toSourceDto(source);
      return dto ? [dto] : [];
    });
  }
}
