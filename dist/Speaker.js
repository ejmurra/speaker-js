import { platform } from "os";
import { spawn, spawnSync } from "child_process";
export default class Speaker {
    constructor() {
        this.platform = platform();
        const supportedPlatforms = [
            "win32",
        ];
        if (!supportedPlatforms.includes(this.platform)) {
            throw new Error(`Unsupported platform: ${this.platform}`);
        }
        switch (this.platform) {
            case "win32": {
                this.initWin();
            }
        }
    }
    get voice() {
        return this._voice;
    }
    set voice(voice) {
        this._voice = voice;
    }
    say(text) {
        switch (this.platform) {
            case "win32": {
                return this.speakWin(text);
            }
            default: {
                return Promise.reject(new Error(`Could not speak on platform ${this.platform}`));
            }
        }
    }
    initWin() {
        this.voice = spawnSync("powershell", [
            `Add-Type -AssemblyName System.speech; 
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.voice.name`
        ]).stdout.toString().slice(0, -1);
    }
    speakWin(text) {
        return new Promise((resolve, reject) => {
            const pshell = spawn("powershell", [
                `Add-Type -AssemblyName System.speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.SelectVoice('${this.voice}'); $speak.Speak([Console]::In.ReadToEnd());`
            ], { shell: true });
            pshell.stderr.setEncoding('utf8');
            pshell.stdin.end(text);
            pshell.stderr.once('data', function (data) {
                data = typeof data === "string" ? data : data.toString();
                return reject(new Error(data));
            });
            pshell.addListener('exit', function (code, signal) {
                if (code === null || signal !== null) {
                    return reject(new Error(`Could not talk, had an error [code: ${code}] [signal: ${signal}]`));
                }
                return resolve();
            });
        });
    }
}
