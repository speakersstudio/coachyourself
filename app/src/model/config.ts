export class Config {
    version: string;
    stripe: string;
}

export class PackageConfig {
    improv_sub_price: number;
    fac_sub_price: number;
    improv_team_sub_price: number;
    fac_team_sub_price: number;
    improv_team_sub_count: number;
    fac_team_sub_count: number;
    fac_team_package_markup: number;

    role_facilitator: number;
    role_facilitator_team: number;
    role_improviser: number;
    role_improviser_team: number;
}