import type {
	TranscriptionSegment,
	TranscriptionWord,
	CaptionChunk,
} from "@/transcription/types";
import {
	DEFAULT_WORDS_PER_CAPTION,
	MIN_CAPTION_DURATION_SECONDS,
} from "@/transcription/caption-defaults";

export function buildCaptionChunks({
	segments,
	words,
	wordsPerChunk = DEFAULT_WORDS_PER_CAPTION,
	minDuration = MIN_CAPTION_DURATION_SECONDS,
}: {
	segments: TranscriptionSegment[];
	words?: TranscriptionWord[];
	wordsPerChunk?: number;
	minDuration?: number;
}): CaptionChunk[] {
	if (words?.length) {
		const validWords = words
			.filter(
				(word) =>
					word.text.trim().length > 0 &&
					Number.isFinite(word.start) &&
					Number.isFinite(word.end) &&
					word.end > word.start,
			)
			.sort((a, b) => a.start - b.start);
		const captions: CaptionChunk[] = [];

		for (let i = 0; i < validWords.length; i += Math.max(1, wordsPerChunk)) {
			const group = validWords.slice(i, i + Math.max(1, wordsPerChunk));
			if (!group.length) continue;
			const startTime = group[0].start;
			const endTime = Math.max(startTime + minDuration, group[group.length - 1].end);
			captions.push({
				text: group.map((word) => word.text.trim()).join(" "),
				startTime,
				duration: endTime - startTime,
			});
		}
		return captions;
	}

	const captions: CaptionChunk[] = [];
	let globalEndTime = 0;

	for (const segment of segments) {
		const wordsInSegment = segment.text.trim().split(/\s+/);
		if (
			wordsInSegment.length === 0 ||
			(wordsInSegment.length === 1 && wordsInSegment[0] === "")
		) {
			continue;
		}

		const segmentDuration = segment.end - segment.start;
		if (!Number.isFinite(segmentDuration) || segmentDuration <= 0) continue;
		const wordsPerSecond = wordsInSegment.length / segmentDuration;

		for (let i = 0; i < wordsInSegment.length; i += Math.max(1, wordsPerChunk)) {
			const chunkWords = wordsInSegment.slice(i, i + Math.max(1, wordsPerChunk));
			const chunkDuration = Math.max(
				minDuration,
				chunkWords.length / wordsPerSecond,
			);
			const estimatedStart = segment.start + (i / wordsInSegment.length) * segmentDuration;
			const adjustedStartTime = Math.max(estimatedStart, globalEndTime);

			captions.push({
				text: chunkWords.join(" "),
				startTime: adjustedStartTime,
				duration: Math.min(
					chunkDuration,
					Math.max(minDuration, segment.end - adjustedStartTime),
				),
			});
			globalEndTime = adjustedStartTime + captions[captions.length - 1].duration;
		}
	}

	return captions;
}
