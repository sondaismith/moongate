import {version,buildDate,commitHash} from "./../../helpers/version"

export interface IVersionDetails{
    version:string,
    buildDate:string,
    commitHash:string,
}

export function GetVersion():IVersionDetails{
    let inDevEnv = import.meta.env.DEV;
    let versionText = inDevEnv ? `${version}_dev` : version;
    return {
        version:versionText,
        buildDate,
        commitHash
    };
}