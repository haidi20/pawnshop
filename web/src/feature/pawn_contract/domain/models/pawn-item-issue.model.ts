export interface PawnItemIssueModel {
    id: number;
    pawnItemId: number;
    issueName: string;
    issueDetails: string | null;
    severityLevel: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
