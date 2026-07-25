import { beforeEach, describe, expect, it, vi } from "vitest";
import { systemRoleNames } from "@/modules/organizations/constants/default-roles";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { ApiErrorCode, AppError } from "@/shared/api/errors";

const mocks = vi.hoisted(() => ({
  requireAppContext: vi.fn(),
  findLeadById: vi.fn(),
  createLeadRecord: vi.fn(),
  updateLeadRecord: vi.fn(),
  softDeleteLead: vi.fn(),
  findDuplicateCandidates: vi.fn(),
  getDefaultStatus: vi.fn(),
  findManyLeads: vi.fn(),
  countLeads: vi.fn(),
  getStatusRecords: vi.fn(),
  getSourceRecords: vi.fn(),
  listMembersByOrganization: vi.fn(),
  findMemberById: vi.fn(),
  normalizeCustomValuesForOrganization: vi.fn(),
  replaceLeadCustomValues: vi.fn(),
  getLeadCustomValues: vi.fn(),
  prismaTransaction: vi.fn(),
}));

vi.mock("@/modules/auth/services/app-context.service", () => ({
  requireAppContext: mocks.requireAppContext,
}));

vi.mock("@/modules/custom-fields", () => ({
  normalizeCustomValuesForOrganization:
    mocks.normalizeCustomValuesForOrganization,
  replaceLeadCustomValues: mocks.replaceLeadCustomValues,
  getLeadCustomValues: mocks.getLeadCustomValues,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => mocks.prismaTransaction(fn),
  },
}));

vi.mock("@/modules/leads/repository/lead.repository", async () => {
  const actual = await vi.importActual<
    typeof import("@/modules/leads/repository/lead.repository")
  >("@/modules/leads/repository/lead.repository");
  return {
    ...actual,
    findLeadById: mocks.findLeadById,
    createLead: mocks.createLeadRecord,
    updateLead: mocks.updateLeadRecord,
    softDeleteLead: mocks.softDeleteLead,
    findDuplicateCandidates: mocks.findDuplicateCandidates,
    getDefaultStatus: mocks.getDefaultStatus,
    findManyLeads: mocks.findManyLeads,
    countLeads: mocks.countLeads,
    getStatuses: mocks.getStatusRecords,
    getSources: mocks.getSourceRecords,
  };
});

vi.mock("@/modules/organizations/repository/member.repository", () => ({
  listMembersByOrganization: mocks.listMembersByOrganization,
  findMemberById: mocks.findMemberById,
}));

function memberContext(
  permissions: string[],
  roleName: string = systemRoleNames.member,
) {
  return {
    user: { id: "u1", name: "User", email: "u@x.com", emailVerified: true },
    organization: { id: "org1", name: "Acme", slug: "acme" },
    member: {
      id: "m1",
      organizationId: "org1",
      userId: "u1",
      roleId: "r1",
      roleName,
      isOwner: roleName === systemRoleNames.owner,
    },
    permissions,
  };
}

function orgMember(
  id: string,
  roleName: string,
  name = "Person",
  email = `${id}@x.com`,
) {
  return {
    id,
    organizationId: "org1",
    userId: `u-${id}`,
    roleId: `r-${id}`,
    user: { name, email },
    role: { id: `r-${id}`, name: roleName },
  };
}

const baseLead = {
  id: "lead1",
  organizationId: "org1",
  statusId: "st1",
  sourceId: null,
  assignedManagerId: null,
  assignedMemberId: "m-other",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: null,
  company: null,
  jobTitle: null,
  website: null,
  description: null,
  isDuplicate: false,
  deletedAt: null,
  createdBy: "m-other",
  updatedBy: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  status: {
    id: "st1",
    organizationId: "org1",
    name: "New",
    color: "blue",
    displayOrder: 1,
    isDefault: true,
    isClosed: false,
    isWon: false,
  },
  source: null,
  assignedMember: null,
  assignedManager: null,
};

describe("lead.service authz and assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findDuplicateCandidates.mockResolvedValue([]);
    mocks.normalizeCustomValuesForOrganization.mockResolvedValue([]);
    mocks.replaceLeadCustomValues.mockResolvedValue(undefined);
    mocks.getLeadCustomValues.mockResolvedValue([]);
    mocks.prismaTransaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn({}),
    );
  });

  it("refuses member update of an unassigned lead", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_UPDATE, Permissions.LEAD_READ]),
    );
    mocks.findLeadById.mockResolvedValue(baseLead);

    const { updateLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(
      updateLead("lead1", { statusId: "st2" }),
    ).rejects.toMatchObject({ code: ApiErrorCode.NOT_FOUND });
    expect(mocks.updateLeadRecord).not.toHaveBeenCalled();
  });

  it("denies member update of disallowed fields even when assignee", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_UPDATE, Permissions.LEAD_READ]),
    );
    mocks.findLeadById.mockResolvedValue({
      ...baseLead,
      assignedMemberId: "m1",
      createdBy: "m-other",
    });

    const { updateLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(
      updateLead("lead1", { firstName: "Augusta" }),
    ).rejects.toMatchObject({ code: ApiErrorCode.PERMISSION_DENIED });
    expect(mocks.updateLeadRecord).not.toHaveBeenCalled();
  });

  it("allows member status/notes update when they are the assignee", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_UPDATE, Permissions.LEAD_READ]),
    );
    mocks.findLeadById.mockResolvedValue({
      ...baseLead,
      assignedMemberId: "m1",
      createdBy: "m-other",
    });
    mocks.updateLeadRecord.mockResolvedValue({});

    const { updateLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await updateLead("lead1", {
      statusId: "st2",
      description: "Called back",
    });
    expect(mocks.updateLeadRecord).toHaveBeenCalledWith(
      expect.anything(),
      "lead1",
      "m1",
      expect.objectContaining({
        statusId: "st2",
        description: "Called back",
      }),
    );
  });

  it("requires LEAD_ASSIGN for assignLead", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_UPDATE, Permissions.LEAD_READ]),
    );

    const { assignLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(
      assignLead("lead1", { assignedMemberId: "m2" }),
    ).rejects.toBeInstanceOf(AppError);
    expect(mocks.updateLeadRecord).not.toHaveBeenCalled();
  });

  it("assigns lead when LEAD_ASSIGN is present and role pool matches", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext(
        [
          Permissions.LEAD_ASSIGN,
          Permissions.LEAD_UPDATE,
          Permissions.LEAD_READ,
        ],
        systemRoleNames.admin,
      ),
    );
    mocks.findLeadById.mockResolvedValueOnce(baseLead).mockResolvedValueOnce({
      ...baseLead,
      assignedMemberId: "m2",
      assignedMember: {
        id: "m2",
        user: { name: "Priya" },
      },
    });
    mocks.findMemberById.mockResolvedValue(
      orgMember("m2", systemRoleNames.member, "Priya"),
    );
    mocks.updateLeadRecord.mockResolvedValue({});

    const { assignLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    const result = await assignLead("lead1", { assignedMemberId: "m2" });
    expect(mocks.updateLeadRecord).toHaveBeenCalledWith(
      expect.anything(),
      "lead1",
      "m1",
      expect.objectContaining({ assignedMemberId: "m2" }),
    );
    expect(result.assignedMemberId).toBe("m2");
  });

  it("rejects assigning a Member into the manager slot", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext(
        [
          Permissions.LEAD_ASSIGN,
          Permissions.LEAD_UPDATE,
          Permissions.LEAD_READ,
        ],
        systemRoleNames.admin,
      ),
    );
    mocks.findLeadById.mockResolvedValue(baseLead);
    mocks.findMemberById.mockResolvedValue(
      orgMember("m2", systemRoleNames.member, "Priya"),
    );

    const { assignLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(
      assignLead("lead1", { assignedManagerId: "m2" }),
    ).rejects.toMatchObject({ code: ApiErrorCode.VALIDATION_FAILED });
    expect(mocks.updateLeadRecord).not.toHaveBeenCalled();
  });

  it("rejects assigning a Manager into the member slot", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext(
        [
          Permissions.LEAD_ASSIGN,
          Permissions.LEAD_UPDATE,
          Permissions.LEAD_READ,
        ],
        systemRoleNames.admin,
      ),
    );
    mocks.findLeadById.mockResolvedValue(baseLead);
    mocks.findMemberById.mockResolvedValue(
      orgMember("m-mgr", systemRoleNames.manager, "Morgan"),
    );

    const { assignLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(
      assignLead("lead1", { assignedMemberId: "m-mgr" }),
    ).rejects.toMatchObject({ code: ApiErrorCode.VALIDATION_FAILED });
    expect(mocks.updateLeadRecord).not.toHaveBeenCalled();
  });

  it("lists member and manager assignee options by role", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_READ]),
    );
    mocks.listMembersByOrganization.mockResolvedValue([
      orgMember("m-owner", systemRoleNames.owner, "Owner"),
      orgMember("m-admin", systemRoleNames.admin, "Admin"),
      orgMember("m-mgr", systemRoleNames.manager, "Manager"),
      orgMember("m-mem", systemRoleNames.member, "Member"),
    ]);

    const { listMemberAssigneeOptions, listManagerAssigneeOptions } =
      await import("@/modules/leads/services/lead.service");

    const members = await listMemberAssigneeOptions();
    const managers = await listManagerAssigneeOptions();

    expect(members.map((item) => item.id)).toEqual(["m-mem"]);
    expect(managers.map((item) => item.id).sort()).toEqual([
      "m-admin",
      "m-mgr",
      "m-owner",
    ]);
    expect(members[0]?.roleName).toBe(systemRoleNames.member);
  });

  it("requires LEAD_DELETE for deleteLead", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_UPDATE, Permissions.LEAD_READ]),
    );

    const { deleteLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(deleteLead("lead1")).rejects.toBeInstanceOf(AppError);
    expect(mocks.softDeleteLead).not.toHaveBeenCalled();
  });

  it("auto-assigns creator as assigned member when lacking LEAD_ASSIGN", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_CREATE, Permissions.LEAD_READ]),
    );
    mocks.findDuplicateCandidates.mockResolvedValue([]);
    mocks.createLeadRecord.mockResolvedValue({ id: "lead-new" });

    const { createLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await createLead({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      statusId: "st1",
    });

    expect(mocks.createLeadRecord).toHaveBeenCalledWith(
      expect.anything(),
      "org1",
      "m1",
      expect.objectContaining({ assignedMemberId: "m1" }),
    );
  });

  it("sets isDuplicate when email matches another lead", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_CREATE, Permissions.LEAD_READ]),
    );
    mocks.findDuplicateCandidates.mockResolvedValue([{ id: "existing" }]);
    mocks.createLeadRecord.mockResolvedValue({ id: "lead-new" });

    const { createLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await createLead({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      statusId: "st1",
    });

    expect(mocks.createLeadRecord).toHaveBeenCalledWith(
      expect.anything(),
      "org1",
      "m1",
      expect.objectContaining({ isDuplicate: true, assignedMemberId: "m1" }),
    );
  });

  it("exposes canEditFull only when LEAD_ASSIGN is present", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_UPDATE, Permissions.LEAD_READ]),
    );

    const { getLeadCapabilities } = await import(
      "@/modules/leads/services/lead.service"
    );

    const caps = await getLeadCapabilities();
    expect(caps.canUpdate).toBe(true);
    expect(caps.canEditFull).toBe(false);
    expect(caps.canAssign).toBe(false);
  });

  it("scopes member getLeads to assignedMemberId", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_READ]),
    );
    mocks.findManyLeads.mockResolvedValue([]);
    mocks.countLeads.mockResolvedValue(0);

    const { getLeads } = await import("@/modules/leads/services/lead.service");
    await getLeads({});

    expect(mocks.findManyLeads).toHaveBeenCalledWith(
      expect.anything(),
      "org1",
      expect.objectContaining({
        where: { assignedMemberId: "m1" },
      }),
    );
  });

  it("scopes manager getLeads to member or manager assignment", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_READ], systemRoleNames.manager),
    );
    mocks.findManyLeads.mockResolvedValue([]);
    mocks.countLeads.mockResolvedValue(0);

    const { getLeads } = await import("@/modules/leads/services/lead.service");
    await getLeads({});

    expect(mocks.findManyLeads).toHaveBeenCalledWith(
      expect.anything(),
      "org1",
      expect.objectContaining({
        where: {
          OR: [{ assignedMemberId: "m1" }, { assignedManagerId: "m1" }],
        },
      }),
    );
  });

  it("does not add assignment scope for admin getLeads", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_READ], systemRoleNames.admin),
    );
    mocks.findManyLeads.mockResolvedValue([]);
    mocks.countLeads.mockResolvedValue(0);

    const { getLeads } = await import("@/modules/leads/services/lead.service");
    await getLeads({ statusId: "st1" });

    expect(mocks.findManyLeads).toHaveBeenCalledWith(
      expect.anything(),
      "org1",
      expect.objectContaining({
        where: { statusId: "st1" },
      }),
    );
  });

  it("hides getLead for member when not assigned", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext([Permissions.LEAD_READ]),
    );
    mocks.findLeadById.mockResolvedValue(baseLead);

    const { getLead } = await import("@/modules/leads/services/lead.service");

    await expect(getLead("lead1")).rejects.toMatchObject({
      code: ApiErrorCode.NOT_FOUND,
    });
  });

  it("blocks manager update outside visibility scope", async () => {
    mocks.requireAppContext.mockResolvedValue(
      memberContext(
        [
          Permissions.LEAD_ASSIGN,
          Permissions.LEAD_UPDATE,
          Permissions.LEAD_READ,
        ],
        systemRoleNames.manager,
      ),
    );
    mocks.findLeadById.mockResolvedValue(baseLead);

    const { updateLead } = await import(
      "@/modules/leads/services/lead.service"
    );

    await expect(
      updateLead("lead1", { firstName: "Nope" }),
    ).rejects.toMatchObject({ code: ApiErrorCode.NOT_FOUND });
    expect(mocks.updateLeadRecord).not.toHaveBeenCalled();
  });
});

describe("lead-access helpers", () => {
  it("builds expected visibility filters", async () => {
    const {
      buildLeadVisibilityWhere,
      isLeadVisibleToMember,
      mergeLeadListWhere,
    } = await import("@/modules/leads/services/lead-access");

    expect(buildLeadVisibilityWhere(systemRoleNames.owner, "m1")).toBeNull();
    expect(buildLeadVisibilityWhere(systemRoleNames.member, "m1")).toEqual({
      assignedMemberId: "m1",
    });
    expect(buildLeadVisibilityWhere(systemRoleNames.manager, "m1")).toEqual({
      OR: [{ assignedMemberId: "m1" }, { assignedManagerId: "m1" }],
    });

    expect(
      mergeLeadListWhere({ statusId: "st1" }, { assignedMemberId: "m1" }),
    ).toEqual({
      AND: [{ statusId: "st1" }, { assignedMemberId: "m1" }],
    });

    expect(
      isLeadVisibleToMember(
        { assignedMemberId: null, assignedManagerId: "m1" },
        systemRoleNames.manager,
        "m1",
      ),
    ).toBe(true);
    expect(
      isLeadVisibleToMember(
        { assignedMemberId: null, assignedManagerId: "m1" },
        systemRoleNames.member,
        "m1",
      ),
    ).toBe(false);
  });
});
