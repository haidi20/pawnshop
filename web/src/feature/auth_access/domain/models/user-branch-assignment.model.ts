export interface UserBranchAssignmentModel {
    id: number;
    userId: number;
    branchId: number;
    isPrimary: boolean;
    assignedAt: string;
    unassignedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
