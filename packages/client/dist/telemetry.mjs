//#region src/telemetry.ts
const identityRedactor = (value) => value;
const redactTelemetryMetadata = (metadata, redact) => {
	if (!metadata) return void 0;
	return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, redact(value, key)]));
};
const withTime = (event, now, redact) => ({
	...event,
	time: event.time ?? new Date(now()).toISOString(),
	attributes: redactTelemetryMetadata(event.attributes, redact)
});
const redactWarning = (warning, redact) => ({
	...warning,
	attributes: redactTelemetryMetadata(warning.attributes, redact)
});
const bestEffort = async (operation) => {
	try {
		await operation();
	} catch {}
};
const formatError = (error) => {
	if (error instanceof Error) return error.stack ?? error.message;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
};
const makeTelemetry = (options = {}) => {
	const sink = options.sink;
	const eventSink = options.event ?? sink?.event;
	const warningSink = options.warning ?? sink?.warning;
	const spanSink = options.span;
	const now = options.now ?? Date.now;
	const redact = options.redact ?? identityRedactor;
	const event = async (input) => {
		const prepared = withTime(input, now, redact);
		await bestEffort(async () => {
			await eventSink?.(prepared);
		});
	};
	const warning = async (input) => {
		const prepared = redactWarning(input, redact);
		await bestEffort(async () => {
			await warningSink?.(prepared);
		});
	};
	const defaultSpan = async (input, operation) => {
		const startedAt = now();
		const baseAttributes = redactTelemetryMetadata(input.attributes, redact);
		await event({
			name: input.name + ".start",
			attributes: {
				...baseAttributes ?? {},
				phase: "start"
			}
		});
		try {
			const result = await operation();
			await event({
				name: input.name + ".finish",
				durationMs: now() - startedAt,
				attributes: {
					...baseAttributes ?? {},
					phase: "finish",
					outcome: "success"
				}
			});
			return result;
		} catch (error) {
			await event({
				name: input.name + ".finish",
				durationMs: now() - startedAt,
				attributes: {
					...baseAttributes ?? {},
					phase: "finish",
					outcome: "failure",
					cause: formatError(error).slice(0, 500)
				}
			});
			throw error;
		}
	};
	return {
		event,
		warning,
		span: spanSink ? async (input, operation) => await spanSink(input, operation) : defaultSpan,
		redact
	};
};
//#endregion
export { makeTelemetry };

//# sourceMappingURL=telemetry.mjs.map