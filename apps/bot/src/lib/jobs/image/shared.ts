export const samplers = {
	k_euler: "Euler",
	k_euler_ancestral: "Euler a",
	k_dpmpp_2s_ancestral: "DPM++ 2S a",
	k_dpmpp_2m: "DPM++ 2M",
	k_dpmpp_sde: "DPM++ SDE",
};

// TODO: move to utils
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const enhancePrompt = "best quality, amazing quality, very aesthetic, absurdres, ";
export const possibleNegativeTags = {
	0: "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract], ",
	1: "nsfw, lowres, jpeg artifacts, worst quality, watermark, blurry, very displeasing, ",
	2: "",
};
