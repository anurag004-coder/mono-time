import os
import re
from typing import Tuple, Optional

# Maximum permitted character length for customer chat inquiries
MAX_INPUT_LENGTH = 500

# High-confidence adversarial injection, jailbreak, and extraction patterns
ADVERSARIAL_INJECTION_PATTERNS = [
    # 1. Instruction overrides & rule bypasses
    r"ignore\s+(all\s+|any\s+|previous\s+|prior\s+)?(instructions|rules|prompts|directives|guidelines)",
    r"disregard\s+(all\s+|any\s+|previous\s+|prior\s+)?(instructions|rules|prompts|directives)",
    r"forget\s+(everything|all\s+previous|prior|instructions|rules)",
    r"override\s+(system|security|all|operational)?\s*(prompt|instructions|rules)",
    r"bypass\s+(all\s+)?(security|guardrails|filters|restrictions)",
    
    # 2. Persona hijacking & jailbreak triggers
    r"you\s+are\s+now\s+(a\s+|an\s+)?(unrestricted|evil|dan|developer|hacker|jailbroken|godmode)",
    r"\b(dan\s+mode|jailbreak|developer\s+mode|unfiltered\s+mode)\b",
    r"act\s+as\s+(an?\s+)?(unrestricted|evil|dan|developer|hacker|system\s+admin)",
    r"system\s*override",
    r"simulate\s+(a\s+)?(mode\s+without\s+rules|jailbroken)",

    # 3. System prompt & instruction extraction attacks
    r"(print|reveal|show|dump|repeat|output|tell\s+me)\s+(your\s+)?(system\s+prompt|initial\s+prompt|instructions\s+verbatim|hidden\s+prompt|developer\s+instructions)",
    r"what\s+(is|are)\s+your\s+(exact\s+)?(system\s+prompt|internal\s+instructions|secret\s+prompt)",
    r"what\s+was\s+written\s+above",
    r"repeat\s+the\s+words\s+above",
    
    # 4. Credential & secret harvesting
    r"(reveal|tell\s+me|show|give\s+me)\s+(the\s+)?(admin\s+password|api\s+key|gemini\s+key|database\s+password|secret\s+key|jwt\s+secret)",
    r"\b(admin\s+password|api\s*key|access\s+token|secret\s+key)\b",
    r"(dump|show)\s+(all\s+)?(credit\s+cards?|orders?\s+database|customer\s+pii)",

    # 5. Injection & code execution vectors
    r"<\s*script[^>]*>",
    r"javascript\s*:",
    r"(drop\s+table|insert\s+into|union\s+select|delete\s+from\s+users|--\s*or\s+1\s*=\s*1)",
    r"\b(exec\s*\(|eval\s*\()",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in ADVERSARIAL_INJECTION_PATTERNS]

GUARDRAIL_DEFLECTION_MESSAGE = (
    "**Mono Time Atelier Security Notice:**\n\n"
    "I am the Mono Time Horology Concierge. I am dedicated strictly to assisting you with our "
    "luxury timepieces, horological specifications, wrist proportions, and boutique acquisitions.\n\n"
    "I cannot alter my core operational parameters, system instructions, or security guidelines. "
    "How may I assist you with our timepiece collection today?"
)


def inspect_input_security(message: str) -> Tuple[bool, Optional[str]]:
    """
    Evaluates customer input against adversarial prompt injection, jailbreak vectors,
    and system extraction attacks.
    
    Returns:
        (is_safe: bool, deflection_message: Optional[str])
    """
    if not message or not message.strip():
        return True, None

    cleaned = message.strip()

    # 1. Length constraint check to prevent token buffer-overflow / context-stuffing
    if len(cleaned) > MAX_INPUT_LENGTH:
        return False, (
            "**Mono Time Concierge Notice:**\n\n"
            "Your message exceeds our boutique security length limit (500 characters). "
            "Please refine your query so our horology team can best assist you."
        )

    # 2. Check against adversarial prompt injection & jailbreak regex patterns
    for pattern in COMPILED_PATTERNS:
        if pattern.search(cleaned):
            return False, GUARDRAIL_DEFLECTION_MESSAGE

    return True, None


def sanitize_output_security(output_text: str) -> str:
    """
    Sanitizes LLM or concierge generated responses to ensure no sensitive tokens,
    passwords, environment keys, or internal hashes leak into customer views.
    """
    if not output_text:
        return output_text

    sanitized = output_text

    # Redact Google API keys
    sanitized = re.sub(r"AIza[0-9A-Za-z-_]{30,}", "[REDACTED_API_KEY]", sanitized)

    # Redact generic bearer or secret tokens
    sanitized = re.sub(r"sk-[0-9A-Za-z-_]{20,}", "[REDACTED_API_KEY]", sanitized)

    # Redact bcrypt password hashes
    sanitized = re.sub(r"\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}", "[REDACTED_PASSWORD_HASH]", sanitized)

    # Redact raw admin password string if echoed
    admin_pass = os.getenv("ADMIN_PASSWORD", "")
    if admin_pass:
        sanitized = re.sub(re.escape(admin_pass), "[PROTECTED_ADMIN_SECRET]", sanitized, flags=re.IGNORECASE)

    return sanitized
