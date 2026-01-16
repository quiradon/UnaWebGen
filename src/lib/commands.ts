export type Cmd = {
    name: string;
    description: string;
    name_localizations?: Record<string, string>;
    description_localizations?: Record<string, string>;
    options?: CmdOption[];
};

export type CmdOption = Cmd & { type: number };

let cachedCommands: Cmd[] | null = null;

export async function getCachedCommands(): Promise<Cmd[]> {
    if (cachedCommands) {
        console.log("Returning cached commands");
        return cachedCommands;
    }

    console.log("Fetching commands from API...");
    try {
        const url = "https://api-rpg.arkanus.app/bot/commands/";
        const res = await fetch(url);
        const data = (await res.json()) as Cmd[];
        cachedCommands = Array.isArray(data) ? data : [];
        return cachedCommands;
    } catch (err) {
        console.error("Error fetching commands:", err);
        return [];
    }
}
