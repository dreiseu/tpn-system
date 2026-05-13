export type User = {
    id: string;
    bioid: string;
    name: string;
    email: string;
    FullName: string;
    Section: string;
    Division: string;
    Position: string;
    SectionName: string;
    PositionName: string;
    UserPrivilege: number;
    email_verified_at: string | null;
    avatar?: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
