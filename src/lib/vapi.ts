import Vapi from "@vapi-ai/web";

let _vapi: any = null;

export function getVapi() {
	if (_vapi) return _vapi;

	const key = process.env.NEXT_PUBLIC_VAPI_API_KEY as string | undefined;
	const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID as string | undefined;

	if (!key) {
		throw new Error(
			"Missing VAPI API key: set NEXT_PUBLIC_VAPI_API_KEY in your environment. " +
			"Get one from https://console.vapi.ai"
		);
	}

	if (!assistantId) {
		throw new Error(
			"Missing VAPI Assistant ID: set NEXT_PUBLIC_VAPI_ASSISTANT_ID in your environment. " +
			"Create an assistant at https://console.vapi.ai"
		);
	}

	// Validate API key format (should be a UUID)
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(key)) {
		console.warn("⚠️ VAPI API key does not appear to be a valid UUID format. This might cause issues.");
	}

	if (!uuidRegex.test(assistantId)) {
		console.warn("⚠️ VAPI Assistant ID does not appear to be a valid UUID format. This might cause issues.");
	}

	try {
		_vapi = new Vapi(key);
		console.log("✅ VAPI instance created successfully");
		return _vapi;
	} catch (err: any) {
		console.error("❌ Failed to create VAPI instance:", err);
		throw new Error("Failed to initialize VAPI: " + (err?.message || String(err)));
	}
}
