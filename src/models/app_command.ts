type Snowflake = string;

export interface ApplicationCommand {
    id: Snowflake,
    type?: ApplicationCommandType,
    application_id: Snowflake,
    guild_id?: Snowflake,
    name: string,
    name_localizations?: Localization
    description: string,
    description_localizations?: Localization,
    options?: Partial<ApplicationCommandOption>[], // max 25
    defaultMemberPermissions?: String[],
    dm_permission?: boolean
    version: Snowflake
    option_names: Partial<ApplicationCommandOption>[]
    names: String[]
}

export interface ApplicationCommandOption {
    type: ApplicationCommandOptionType,
    name: string, // 1-32 chars
    name_localizations?: Localization,
    description: string, // 1-100 chars
    description_localizations: Localization,
    required?: boolean,
    choices?: Partial<ApplicationCommandOptionChoice>[], // max 25
    options?: Partial<ApplicationCommandOption>[], // max 25
    channel_types?: ChannelType[],
    min_value?: number,
    max_value?: number,
    autocomplete?: boolean
}

export interface ApplicationCommandOptionChoice {
    name: string, // max 100 chars
    name_localizations: Localization,
    value: string | number; // max 100 chars
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11,
}

export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_NEWS = 5,
    GUILD_NEWS_THREAD = 10,
    GUILD_PUBLIC_THREAD = 11,
    GUILD_PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
}

export interface Localization {
    [key: string]: string;
}

export enum Locale {
    Danish = 'da',
    German = 'de',
    English_UK = 'en-GB',
    English_US = 'en-US',
    Spanish = 'es-ES',
    French = 'fr',
    Croatian = 'hr',
    Italian = 'it',
    Lithuanian = 'lt',
    Hungarian = 'hu',
    Dutch = 'nl',
    Norwegian = 'no',
    Polish = 'pl',
    Portuguese_Brazilian = 'pt-BR',
    Romanian = 'ro',
    Finnish = 'fi',
    Swedish = 'sv-SE',
    Vietnamese = 'vi',
    Turkish = 'tr',
    Czech = 'cs',
    Greek = 'el',
    Bulgarian = 'bg',
    Russian = 'ru',
    Ukrainian = 'uk',
    Hindi = 'hi',
    Thai = 'th',
    Chinese_China = 'zh-CN',
    Japanese = 'ja',
    Chinese_Taiwan = 'zh-TW',
    Korean = 'ko',
}

export enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}



export enum Permissions {
    CREATE_INSTANT_INVITE = "CreateInstantInvite",
    KICK_MEMBERS = "KickMembers",
    BAN_MEMBERS = "BanMembers",
    ADMINISTRATOR = "Administrator",
    MANAGE_CHANNELS = "ManageChannels",
    MANAGE_GUILD = "ManageGuild",
    ADD_REACTIONS = "AddReactions",
    VIEW_AUDIT_LOG = "ViewAuditLog",
    PRIORITY_SPEAKER = "PrioritySpeaker",
    STREAM = "Stream",
    VIEW_CHANNEL = "ViewChannel",
    SEND_MESSAGES = "SendMessages",
    SEND_TTS_MESSAGES = " SendTTSMessages",
    MANAGE_MESSAGES = "ManageMessages",
    EMBED_LINKS = "EmbedLinks",
    ATTACH_FILES = "AttachFiles",
    READ_MESSAGE_HISTORY = "ReadMessageHistory",
    MENTION_EVERYONE = "MentionEveryone",
    USE_EXTERNAL_EMOJIS = "UseExternalEmojis",
    VIEW_GUILD_INSIGHTS = "ViewGuildInsights",
    CONNECT = "Connect",
    SPEAK = "Speak",
    MUTE_MEMBERS = "MuteMembers",
    DEAFEN_MEMBERS = "DeafenMembers",
    MOVE_MEMBERS = "MoveMembers",
    USE_VAD = "UseVAD",
    CHANGE_NICKNAME = "ChangeNickname",
    MANAGE_NICKNAMES = "ManageNicknames",
    MANAGE_ROLES = "ManageRoles",
    MANAGE_WEBHOOKS ="ManageWebhooks",
    MANAGE_EMOJIS_AND_STICKERS = "ManageGuildExpressions",
    USE_APPLICATION_COMMANDS = "UseApplicationCommands",
    REQUEST_TO_SPEAK = "RequestToSpeak",
    MANAGE_EVENTS = "ManageEvents",
    MANAGE_THREADS = "ManageThreads",
    CREATE_PUBLIC_THREADS = "CreatePublicThreads",
    CREATE_PRIVATE_THREADS = "CreatePrivateThreads",
    USE_EXTERNAL_STICKERS = "UseExternalStickers",
    SEND_MESSAGES_IN_THREADS = "SendMessagesInThreads",
    USE_EMBEDDED_ACTIVITIES = "UseEmbeddedActivities",
    MODERATE_MEMBERS = "ModerateMembers",
    VIEW_CREATOR_MONETIZATION_ANALYTICS = "ViewCreatorMonetizationAnalytics",
    USE_SOUNDBOARD = "UseSoundboard",
    CREATE_GUILD_EXPRESSIONS = "CreateGuildExpressions",
    CREATE_EVENTS = "CreateEvents",
    USE_EXTERNAL_SOUNDS = "UseExternalSounds",
    SEND_VOICE_MESSAGES = " SendVoiceMessages",
}