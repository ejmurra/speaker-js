export default class Speaker {
    platform: string;
    _voice: string;
    voice: string;
    constructor();
    say(text: string): Promise<any>;
    private initWin();
    private speakWin(text);
}
