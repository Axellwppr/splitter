<template>
    <v-app>
        <v-app-bar elevate-on-scroll app color="light-blue lighten-1" dark>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>

            <v-toolbar-title>听力切分器</v-toolbar-title>

            <v-spacer></v-spacer>

            <!-- <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn> -->
        </v-app-bar>
        <v-main>
            <v-container>
                <span v-if="step == 10 && data.length">
                    <template v-for="(el, index) in data">
                        <v-row align="start" justify="center" :key="index">
                            <v-col
                                v-if="el.tag == 'Pause'"
                                cols="8"
                                sm="5"
                                style="max-width: 275px"
                            >
                                <div
                                    class="
                                        pa-4
                                        blue-grey
                                        darken-2
                                        rounded-pill
                                        text-center
                                        white--text
                                    "
                                >
                                    Pause duration:{{ el.durationH }} s
                                </div>
                            </v-col>
                            <v-col v-else cols="11" sm="8">
                                <v-card
                                    :color="
                                        el.tag !== 'Instruction'
                                            ? 'orange darken-1'
                                            : 'teal'
                                    "
                                    dark
                                >
                                    <v-card-title class="text-h5">
                                        {{ el.tag }}
                                    </v-card-title>

                                    <v-card-subtitle class="d-flex pb-0">
                                        <div class="mr-3">
                                            start: {{ times(el.startH) }}
                                        </div>
                                        <div class="mr-3">
                                            end: {{ times(el.endH) }}
                                        </div>
                                        <div class="mr-3">
                                            duration: {{ el.durationH }} s
                                        </div>
                                        <v-spacer />
                                        <div>
                                            state:
                                            <span
                                                v-if="ready[index]"
                                                class="white--text"
                                                >ready</span
                                            ><span v-else>null</span>
                                        </div>
                                    </v-card-subtitle>

                                    <v-card-actions>
                                        <v-spacer />
                                        <v-btn
                                            text
                                            :disabled="!ready[index]"
                                            @click="process(el, 'listen')"
                                        >
                                            Listen
                                        </v-btn>
                                        <v-btn
                                            text
                                            :disabled="!ready[index]"
                                            @click="process(el, 'download')"
                                        >
                                            Download
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </template>
                </span>
                <v-dialog
                    :value="step == 10 && !data.length"
                    persistent
                    width="390px"
                    open-delay="500"
                    scrollable
                >
                    <v-card>
                        <v-card-title> An Error Occurred </v-card-title>
                        <v-card-text> 该音频中没有有效片段</v-card-text>
                    </v-card>
                </v-dialog>
            </v-container>
            <v-dialog
                :value="step == 0"
                persistent
                width="390px"
                scrollable
                open-delay="500"
                close-delay="1000"
            >
                <v-card>
                    <v-card-title> 静态组件加载中 </v-card-title>

                    <v-card-text>
                        <v-progress-linear
                            indeterminate
                            color="cyan"
                        ></v-progress-linear
                        >正在加载FFMPEG,请稍候</v-card-text
                    >
                </v-card>
            </v-dialog>
            <v-dialog
                :value="step == 1"
                persistent
                width="390px"
                scrollable
                open-delay="500"
                close-delay="1000"
            >
                <v-card>
                    <v-card-title> 选择听力文件 </v-card-title>

                    <v-card-text>
                        <v-form ref="form">
                            <v-file-input
                                class="pt-2"
                                show-size
                                outlined
                                dense
                                accept="audio/mp3"
                                label="请点此选择文件"
                                v-model="file"
                                :rules="[
                                    (value) =>
                                        !value ||
                                        value.size < 40000000 ||
                                        'Audio size should be less than 40 MB!',
                                    (value) =>
                                        !value ||
                                        value.type == 'audio/mpeg' ||
                                        'Audio file should be of MP3 format!',
                                ]"
                            ></v-file-input>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="inputDone()"> OK </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog
                :value="step == 2"
                persistent
                width="390px"
                scrollable
                open-delay="500"
                close-delay="1000"
            >
                <v-card>
                    <v-card-title> 正在处理 </v-card-title>

                    <v-card-text>
                        <v-progress-linear
                            :value="progress.num"
                            color="cyan"
                        ></v-progress-linear
                        >正在对该文件进行分割,请稍候</v-card-text
                    >
                </v-card>
            </v-dialog>
            <v-dialog
                :value="player.show"
                persistent
                width="410px"
                scrollable
                open-delay="500"
                close-delay="1000"
            >
                <v-card>
                    <v-card-title>
                        音频{{ player.type == "listen" ? "预览" : "下载" }}
                    </v-card-title>

                    <v-card-text v-if="!player.src">
                        该片段尚未切割完成,请等待切割完成后再次点击按钮</v-card-text
                    >
                    <v-card-text class="text-center px-1" v-else>
                        <audio
                            v-if="player.type == 'listen'"
                            :src="player.src"
                            controls="controls"
                        >
                            Your browser do NOT support audio feature!
                        </audio>
                        <a v-else :href="player.src" :download="player.name"
                            >Click to Download</a
                        >
                    </v-card-text>
                    <v-card-actions v-if="!player.loading">
                        <v-spacer />
                        <v-btn text @click="player.show = false"> CLOSE </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog
                :value="step <= -10"
                persistent
                width="390px"
                open-delay="500"
                scrollable
            >
                <v-card>
                    <v-card-title> An Error Occurred </v-card-title>

                    <v-card-text>
                        <span v-if="step == -10"
                            >FFMPEG加载失败,请刷新网页重试<br />{{
                                ffmpegE
                            }}</span
                        >
                        <span v-if="step == -11"
                            >切分失败,请刷新网页重试</span
                        ></v-card-text
                    >
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<script>
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    // log: true,
});
import { create, all, pi } from "mathjs";
const math = create(all, {
    number: "BigNumber",
});
var matchOne = (silenceH, piece) => {
    var check = (s) => {
        for (var i = 0; i <= 3; ++i) if (s[i] != 10) return false;
        if (s[4] != 5) return false;
        var t = 0;
        for (var i = 5; i < s.length - 1; i += 2) {
            if (s[i] != s[i + 1] || s[i] % 5 != 0 || s[i + 1] % 5 != 0)
                return false;
            t += s[i] / 5;
        }
        if (t != 15) return false;
        return true;
    };
    var point = -1;
    for (var i = 1; i + 15 <= silenceH.length; ++i) {
        if (check(silenceH.slice(i, i + 15))) point = i;
    }
    if (point == -1) return false;
    var txtN = 1;
    for (var i = point - 1; i <= point + 3; ++i) {
        piece[i].tag = "Text" + txtN++;
    }
    for (var i = point + 5; i <= point + 13; i += 2) {
        piece[i].tag = "Text" + txtN++;
    }
    return true;
};
export default {
    name: "App",
    data: () => ({
        data: [],
        ready: [],
        step: 0,
        file: null,
        player: {
            show: false,
            loading: false,
            src: "",
            type: "",
            name: "",
        },
        ffmpegE: "",
        uid: 0,
        halt: 0,
        progress: {
            running: false,
            num: 0,
        },
    }),
    async mounted() {
        //load FFMPEG
        try {
            await ffmpeg.load();
            await ffmpeg.run("-v");
            ffmpeg.setProgress((v) => {
                // console.log(v);
                this.progress.num = Math.round(v.ratio * 1000) / 10;
            });
        } catch (e) {
            this.ffmpegE = e.toString();
            this.step = -10;
            return false;
        }
        this.step = 1;
        return true;
    },
    methods: {
        times(time) {
            let timeStr = "";
            let stringFormat = (i) => {
                return i < 10 ? `0${i}` : `${i}`;
            };
            let minuteTime = 0;
            let secondTime = 0;
            let hourTime = 0;
            if (time < 60) {
                timeStr = `00:${stringFormat(time)}`;
            } else if (time >= 60 && time < 3600) {
                minuteTime = parseInt(time / 60);
                secondTime = parseInt(time % 60);
                timeStr = `${stringFormat(minuteTime)}:${stringFormat(
                    secondTime
                )}`;
            } else if (time >= 3600) {
                let _t = parseInt(time % 3600);
                hourTime = parseInt(time / 3600);
                minuteTime = parseInt(_t / 60);
                secondTime = parseInt(_t % 60);
                timeStr = `${stringFormat(hourTime)}:${stringFormat(
                    minuteTime
                )}:${stringFormat(secondTime)}`;
            }
            return timeStr;
        },
        async split(el) {
            if (this.progress.running) return;
            try {
                this.progress.running = true;
                await ffmpeg.run(
                    "-i",
                    "input.mp3",
                    "-ss",
                    math.chain(el.start).toString(),
                    "-t",
                    math.chain(el.duration).toString(),
                    `output_${this.uid}.mp3`
                );
                var data = ffmpeg.FS("readFile", `output_${this.uid}.mp3`);
                var url = URL.createObjectURL(
                    new Blob([data.buffer], { type: "audio/mp3" })
                );
                ffmpeg.FS("unlink", `output_${this.uid}.mp3`);
                this.uid++;
            } catch (e) {
                console.log(e, el);
                this.step = -11;
            }
            this.progress.running = false;
            return url;
        },
        async inputDone() {
            if (!this.$refs.form.validate()) return false;
            if (!this.file) return false;
            this.step = 2;

            try {
                //load file
                var input = this.file;
                ffmpeg.FS("writeFile", "input.mp3", await fetchFile(input));
                console.log("File Loaded");

                //silence detect
                var silence = [];
                var silenceH = [];
                var piece = [];
                ffmpeg.setLogger(({ type, message }) => {
                    // console.log(type, message);
                    var x = message.match(
                        /^\[silencedetect @ \S{9}\] silence_end: (\S*) \| silence_duration: (\S*)/
                    );
                    if (x) {
                        var end = math.evaluate(x[1]);
                        var duration = math.evaluate(x[2]);
                        silence.push({
                            start: math.subtract(end, duration),
                            end,
                            duration,
                            startH: math
                                .chain(math.subtract(end, duration))
                                .round()
                                .toString(),
                            endH: math.chain(end).round().toString(),
                            durationH: math.chain(duration).round(2).toString(),
                            tag: "Pause",
                        });
                        var near5 = math
                            .chain(duration)
                            .ceil()
                            .divide(5)
                            .floor()
                            .multiply(5)
                            .done();
                        console.log(
                            math
                                .chain(duration)
                                .subtract(near5)
                                .smallerEq(2)
                                .done() &&
                                math
                                    .chain(duration)
                                    .subtract(near5)
                                    .largerEq(-0.5)
                                    .done()
                        );
                        if (
                            math
                                .chain(duration)
                                .subtract(near5)
                                .smallerEq(2)
                                .done() &&
                            math
                                .chain(duration)
                                .subtract(near5)
                                .largerEq(-0.5)
                                .done()
                        ) {
                            silenceH.push(
                                math.numeric(math.round(near5, 2), "number")
                            );
                        } else {
                            silenceH.push(
                                math.numeric(math.round(duration, 2), "number")
                            );
                        }
                        if (silence.length > 1) {
                            piece.push({
                                start: silence[silence.length - 2].end,
                                end: silence[silence.length - 1].start,
                                duration: math.subtract(
                                    silence[silence.length - 1].start,
                                    silence[silence.length - 2].end
                                ),
                                startH: math
                                    .chain(silence[silence.length - 2].end)
                                    .round()
                                    .toString(),
                                endH: math
                                    .chain(silence[silence.length - 1].start)
                                    .round()
                                    .toString(),
                                durationH: math
                                    .chain(
                                        math.subtract(
                                            silence[silence.length - 1].start,
                                            silence[silence.length - 2].end
                                        )
                                    )
                                    .round(2)
                                    .toString(),
                                tag: "Instruction",
                            });
                        }
                    }
                });
                await ffmpeg.run(
                    "-i",
                    "input.mp3",
                    "-af",
                    "silencedetect=n=-50dB:d=4",
                    "-f",
                    "null",
                    "-"
                );
                console.log(silenceH);
                console.log(silence);
                ffmpeg.setLogging(false);

                //get pieces
                console.log(piece);
                for (var i = 1; i < silenceH.length; ++i) {
                    if (silenceH[i] >= 30) {
                        silenceH.splice(i);
                        break;
                    }
                }
                //match exp1
                if (matchOne(silenceH, piece)) {
                    console.log("match rule 1");
                    console.log(piece);
                } else {
                    console.log("no rule match");
                    for (var i = 0; i < piece.length; ++i) {
                        piece[i].tag = "Unknown";
                    }
                    // return false;
                }
                var final = [];
                if (silence[0]) final.push(silence[0]);
                for (var i = 0; i < piece.length; ++i) {
                    final.push(piece[i]);
                    if (silence[i + 1]) final.push(silence[i + 1]);
                }
                console.log(final);
                this.data = final;
                this.ready = new Array(final.length);
                this.background();
                this.step = 10;
            } catch (e) {
                this.step = -11;
            }
        },
        async process(el, pro) {
            try {
                this.player.show = true;
                this.player.type = pro;
                this.player.name = `${this.file.name} sub_${this.times(
                    el.startH
                )}_${this.times(el.endH)}.mp3`;
                this.player.src = el.src;
            } catch (e) {
                this.step = -11;
            }
        },
        background() {
            this.interval = setInterval(async () => {
                if (this.halt > 0) return false;
                console.log("Finding");
                this.halt = 1;
                var point = -1;
                for (var i = 0; i < this.data.length; ++i) {
                    if (point >= 0) break;
                    if (
                        this.data[i].tag.indexOf("Text") == 0 &&
                        !this.data[i].src
                    ) {
                        console.log(this.data[i].tag);
                        point = i;
                    }
                }
                for (var i = 0; i < this.data.length; ++i) {
                    if (point >= 0) break;
                    if (this.data[i].tag != "Pause" && !this.data[i].src) {
                        console.log(this.data[i].tag);
                        point = i;
                    }
                }
                if (point == -1) {
                    clearInterval(this.interval);
                    return;
                }
                console.log(point);
                var url = await this.split(this.data[point]);
                console.log("OK");
                this.data[point].src = url;
                this.$set(this.ready, point, true);
                if (this.halt != 2) this.halt = 0;
            }, 1000);
        },
    },
};
</script>
