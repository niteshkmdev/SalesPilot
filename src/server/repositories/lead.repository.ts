import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  CreateLeadDto,
  LeadListFilters,
  UpdateLeadDto,
} from "../dto/lead.dto";
import { emptyToNull } from "../dto/lead.dto";

function toCreateData(data: CreateLeadDto) {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: emptyToNull(data.email),
    phone: emptyToNull(data.phone),
    company: emptyToNull(data.company),
    jobTitle: emptyToNull(data.jobTitle),
    website: emptyToNull(data.website),
    description: emptyToNull(data.description),
    statusId: data.statusId,
    sourceId: emptyToNull(data.sourceId),
    assignedManagerId: emptyToNull(data.assignedManagerId),
    assignedMemberId: emptyToNull(data.assignedMemberId),
  };
}

export class LeadRepository {
  async create(
    organizationId: string,
    createdById: string,
    data: CreateLeadDto,
  ) {
    return prisma.lead.create({
      data: {
        organizationId,
        createdBy: createdById,
        ...toCreateData(data),
      },
    });
  }

  async update(leadId: string, updatedById: string, data: UpdateLeadDto) {
    const patch: Prisma.LeadUpdateInput = {
      updater: { connect: { id: updatedById } },
    };

    if (data.firstName !== undefined) patch.firstName = data.firstName.trim();
    if (data.lastName !== undefined) patch.lastName = data.lastName.trim();
    if (data.email !== undefined) patch.email = emptyToNull(data.email);
    if (data.phone !== undefined) patch.phone = emptyToNull(data.phone);
    if (data.company !== undefined) patch.company = emptyToNull(data.company);
    if (data.jobTitle !== undefined)
      patch.jobTitle = emptyToNull(data.jobTitle);
    if (data.website !== undefined) patch.website = emptyToNull(data.website);
    if (data.description !== undefined) {
      patch.description = emptyToNull(data.description);
    }
    if (data.statusId !== undefined) {
      patch.status = { connect: { id: data.statusId } };
    }
    if (data.sourceId !== undefined) {
      const sourceId = emptyToNull(data.sourceId);
      patch.source = sourceId
        ? { connect: { id: sourceId } }
        : { disconnect: true };
    }
    if (data.assignedMemberId !== undefined) {
      const assignedMemberId = emptyToNull(data.assignedMemberId);
      patch.assignedMember = assignedMemberId
        ? { connect: { id: assignedMemberId } }
        : { disconnect: true };
    }
    if (data.assignedManagerId !== undefined) {
      const assignedManagerId = emptyToNull(data.assignedManagerId);
      patch.assignedManager = assignedManagerId
        ? { connect: { id: assignedManagerId } }
        : { disconnect: true };
    }
    if (data.isDuplicate !== undefined) patch.isDuplicate = data.isDuplicate;

    return prisma.lead.update({
      where: { id: leadId },
      data: patch,
    });
  }

  async findById(leadId: string, organizationId: string) {
    return prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
        deletedAt: null,
      },
      include: {
        status: true,
        source: true,
        assignedMember: { include: { user: true } },
        assignedManager: { include: { user: true } },
      },
    });
  }

  buildListWhere(filters?: LeadListFilters): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};

    if (filters?.statusId) {
      where.statusId = filters.statusId;
    }

    if (filters?.sourceId) {
      where.sourceId = filters.sourceId;
    }

    const q = filters?.q?.trim();
    if (q) {
      // Escape regex metacharacters — MongoDB insensitive mode uses RegEx.
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      where.OR = [
        { firstName: { contains: safe, mode: "insensitive" } },
        { lastName: { contains: safe, mode: "insensitive" } },
        { email: { contains: safe, mode: "insensitive" } },
        { phone: { contains: safe, mode: "insensitive" } },
        { company: { contains: safe, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async findMany(
    organizationId: string,
    options?: {
      skip?: number;
      take?: number;
      where?: Prisma.LeadWhereInput;
      orderBy?: Prisma.LeadOrderByWithRelationInput;
    },
  ) {
    return prisma.lead.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...options?.where,
      },
      include: {
        status: true,
        source: true,
        assignedMember: { include: { user: true } },
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: "desc" },
    });
  }

  async count(organizationId: string, where?: Prisma.LeadWhereInput) {
    return prisma.lead.count({
      where: {
        organizationId,
        deletedAt: null,
        ...where,
      },
    });
  }

  async softDelete(leadId: string, deletedById: string) {
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        deletedAt: new Date(),
        updater: { connect: { id: deletedById } },
      },
    });
  }

  async getDefaultStatus(organizationId: string) {
    return prisma.organizationLeadStatus.findFirst({
      where: { organizationId, isDefault: true },
    });
  }

  async getStatuses(organizationId: string) {
    return prisma.organizationLeadStatus.findMany({
      where: { organizationId },
      orderBy: { displayOrder: "asc" },
    });
  }

  async getSources(organizationId: string) {
    return prisma.organizationLeadSource.findMany({
      where: { organizationId, active: true },
      orderBy: { displayOrder: "asc" },
    });
  }
}
