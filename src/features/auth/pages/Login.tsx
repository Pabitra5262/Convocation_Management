import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    Globe,
    KeyRound,
    LockKeyhole,
    RefreshCw,
    ScanText,
    ShieldCheck,
    ShieldUser,
    User,
    UserPlus,
    UserSearch,
    type LucideIcon,
} from "lucide-react";
import { setToken } from "../slice/authSlice";
import { IMAGES } from "@/assets/images";
import { Button, IconButton } from "@/shared/components/ui/Button";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { PlatformHub, type HubPhase } from "../components/PlatformHub";
import { createCaptcha, type Captcha } from "../utils/captcha";
import { LANGUAGES, USER_ROLES } from "@/shared/components/layout/Header/header.data";
import { useI18n } from "@/shared/i18n/I18nProvider";
import type { Lang } from "@/shared/i18n/translations";
import "../styles/login.css";

/* Login page ported from hims-ui-new pages/LoginPage.tsx. Styles: features/auth/styles/login.css */

/**
 * Success sequence: the hub turns green and the card confirms who signed in; at WIPE_MS the dashboard colour wipes
 * out from the card, and at GRANTED_MS the dashboard opens. With reduced motion there is no wipe and it opens at STILL_MS.
 */
const GRANTED_MS = 1600;
const WIPE_MS = 1150;
const STILL_MS = 1000;

/**
 * Sign-in without an account service yet: any values — even empty fields or a wrong captcha — log in.
 * Set to false to require username, password and the matching captcha again.
 */
const DEMO_LOGIN = true;

/** Name shown on the success card when Login is pressed with the username left empty. */
const DEMO_USER = "Guest User";

/** The role the app will open in (the one last chosen in the header, else the first role). */
const startingRole = () => {
    try {
        const r = localStorage.getItem("arf.activeRole");
        if (r && USER_ROLES.includes(r)) return r;
    } catch {
        /* storage unavailable */
    }
    return USER_ROLES[0];
};

/** Up to two initials from a name or username ("aarav.sharma" → "AS"). */
const initials = (name: string) =>
    name.split(/[^\p{L}]+/u).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/** The login page offers English and Odia only. */
const LOGIN_LANGUAGES = LANGUAGES.filter((l) => l.code !== "hi");
const LANG_KEY = "arf.lang";

const readLang = () => {
    try {
        const v = localStorage.getItem(LANG_KEY);
        return v && LOGIN_LANGUAGES.some((l) => l.code === v) ? v : "en";
    } catch {
        return "en";
    }
};

/** Remembers the choice (shared with the header's language menu) and sets the page language. */
const applyLang = (code: string) => {
    try {
        localStorage.setItem(LANG_KEY, code);
    } catch {
        /* storage unavailable */
    }
    document.documentElement.lang = code;
};

type Tone = "blue" | "amber" | "green";

/** Coloured icon tile used at the start of each field and on the help links. */
const Tile = ({ icon: TileIcon, tone }: { icon: LucideIcon; tone: Tone }) => (
    <span className={`login-tile login-tile--${tone}`} aria-hidden>
        <TileIcon size={16} strokeWidth={2} />
    </span>
);

/** Large sign-in field: icon tile, input, optional trailing control. */
const LoginField = ({ tile, end, error, ...input }: React.InputHTMLAttributes<HTMLInputElement> & { tile: ReactNode; end?: ReactNode; error?: boolean }) => (
    <div className={`ui-field login-field ${error ? "ui-field--error" : ""}`}>
        {tile}
        <input {...input} aria-invalid={error || undefined} />
        {end}
    </div>
);

const RECOVER: readonly { label: string; icon: LucideIcon; tone: Tone }[] = [
    { label: "Find username", icon: UserSearch, tone: "blue" },
    { label: "Forgot password", icon: KeyRound, tone: "amber" },
];

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [answer, setAnswer] = useState("");
    const [captcha, setCaptcha] = useState<Captcha | null>(null);
    const [failure, setFailure] = useState("");
    const [invalid, setInvalid] = useState<{ username?: boolean; password?: boolean; captcha?: boolean }>({});
    const [lang, setLangState] = useState(readLang);
    const i18n = useI18n();
    // Sign-in state, shared by the form and the hub: idle → verifying → success (then the dashboard opens).
    const [phase, setPhase] = useState<HubPhase>("idle");
    const [signedInAs, setSignedInAs] = useState("");
    const busy = phase === "verifying";
    const still = useMediaQuery("(prefers-reduced-motion: reduce)");
    // The success card keeps the form's height so nothing jumps; the wipe grows from the card's centre.
    const stackRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [cardHeight, setCardHeight] = useState<number>();
    const [wipeFrom, setWipeFrom] = useState<{ x: number; y: number } | null>(null);

    const newCaptcha = useCallback(() => {
        setAnswer("");
        setCaptcha(createCaptcha());
    }, []);

    // First captcha after mount (canvas drawing needs the DOM).
    useEffect(() => {
        const id = requestAnimationFrame(newCaptcha);
        return () => cancelAnimationFrame(id);
    }, [newCaptcha]);

    // Success: wipe, then store the token and open the dashboard (storing it earlier would redirect mid-animation).
    useEffect(() => {
        if (phase !== "success") return;
        const open = () => {
            dispatch(setToken("dummy-token"));
            navigate("/dashboard", { replace: true });
        };
        if (still) {
            const id = setTimeout(open, STILL_MS);
            return () => clearTimeout(id);
        }
        const wipe = setTimeout(() => {
            const card = cardRef.current?.getBoundingClientRect();
            if (card) setWipeFrom({ x: card.left + card.width / 2, y: card.top + card.height / 2 });
        }, WIPE_MS);
        const id = setTimeout(open, GRANTED_MS);
        return () => {
            clearTimeout(wipe);
            clearTimeout(id);
        };
    }, [phase, navigate, dispatch, still]);

    const setLang = (code: string) => {
        setLangState(code);
        applyLang(code);
        // The app shell's translations follow the choice made here.
        i18n.setLang(code as Lang);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (phase !== "idle") return;

        if (!DEMO_LOGIN) {
            const missing = { username: !username.trim(), password: !password, captcha: !answer.trim() };
            if (missing.username || missing.password || missing.captcha) {
                setInvalid(missing);
                setFailure("Enter your username, password and the characters in the image.");
                return;
            }
        }
        if (!DEMO_LOGIN && (!captcha || answer.trim() !== captcha.text)) {
            setInvalid({ captcha: true });
            setFailure("The characters do not match the image. Try the new one.");
            newCaptcha();
            return;
        }

        setInvalid({});
        setFailure("");
        setPhase("verifying");
        window.setTimeout(() => {
            setSignedInAs(username.trim() || DEMO_USER);
            setCardHeight(cardRef.current?.getBoundingClientRect().height);
            setPhase("success");
        }, still ? 0 : 700);
    };

    const notReady = (title: string) => toast.info(`${title}: this opens once the account service is connected.`);

    return (
        <div className="login-page">
            <div className="login-bg" aria-hidden style={{ "--login-photo": `url(${IMAGES.LOGIN_CAMPUS})` } as CSSProperties} />

            {/* Language switch: a small pill in the top right corner of the page. */}
            <div className="login-lang">
                <Globe size={13} />
                <div role="radiogroup" aria-label="Language" className="login-seg">
                    {LOGIN_LANGUAGES.map((l) => (
                        <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} onClick={() => setLang(l.code)}>
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <section className="login-scene" aria-label="HIMS Plus">
                <div className="flex items-center gap-3.5">
                    <img src={IMAGES.ODISHA_EMBLEM} alt="Government of Odisha" className="login-emblem h-12 w-auto shrink-0 sm:h-14" />
                    <div className="h-11 w-px bg-current opacity-20" />
                    <div className="min-w-0">
                        <img src={IMAGES.HIMS_PLUS_LOGO} alt="HIMS Plus" className="login-wordmark h-8 w-auto sm:h-10" />
                        <p className="login-sub mt-1 text-[0.6875rem] uppercase leading-snug tracking-[0.08em] sm:text-xs">
                            Higher Education Information Management System
                        </p>
                    </div>
                </div>
                <div className="login-art">
                    <div className="login-hub">
                        <PlatformHub phase={phase} motion={still ? "off" : "standard"} />
                    </div>
                </div>
            </section>

            <main className="login-side">
                <div className="login-stack" ref={stackRef}>
                    {/* Platform slogan: kept in English as a fixed tagline in every language. */}
                    <div className="login-hero">
                        <h1 lang="en" className="login-hero-text">
                            <span>One State. One Platform.</span>
                            <span className="login-hero-accent">One Source of Truth.</span>
                        </h1>
                    </div>

                    <div ref={cardRef} className="ui-card login-card" style={phase === "success" && cardHeight ? { minHeight: cardHeight } : undefined}>
                        {phase === "success" ? (
                            <div className="login-done" role="status">
                                <svg className="login-done-mark" viewBox="0 0 92 92" aria-hidden>
                                    <circle className="login-done-disc" cx={46} cy={46} r={40} />
                                    <circle className="login-done-ring" cx={46} cy={46} r={40} pathLength={100} />
                                    <path className="login-done-tick" d="M28 47l12 12 24-26" pathLength={100} />
                                </svg>
                                <h2 className="text-[1.75rem] font-bold leading-tight text-foreground">Access granted</h2>
                                <p className="login-done-who">
                                    <span className="login-done-avatar" aria-hidden>{initials(signedInAs)}</span>
                                    <span><b>{signedInAs}</b> · {startingRole()}</span>
                                </p>
                                <p className="text-[0.8125rem] text-text-secondary">Opening your dashboard…</p>
                                <div className="login-granted" aria-hidden>
                                    <span style={{ animationDuration: `${still ? STILL_MS : WIPE_MS}ms` }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="login-head">
                                    <span className="login-head-icon" aria-hidden>
                                        <ShieldUser size={24} strokeWidth={2} />
                                    </span>
                                    <h2 className="login-title">Sign in</h2>
                                </div>
                                <p className="login-subtitle">Use your HIMS Plus username and password.</p>

                                {failure && (
                                    <div role="alert" className="login-alert">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                        <span>{failure}</span>
                                    </div>
                                )}

                                <form className="login-form" onSubmit={submit} noValidate>
                                    <LoginField
                                        tile={<Tile icon={User} tone="blue" />}
                                        aria-label="Username"
                                        placeholder="Enter username"
                                        autoComplete="username"
                                        value={username}
                                        error={invalid.username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <LoginField
                                        tile={<Tile icon={LockKeyhole} tone="amber" />}
                                        aria-label="Password"
                                        placeholder="Enter password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        error={invalid.password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        end={
                                            <button
                                                type="button"
                                                className="login-eye"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                aria-pressed={showPassword}
                                                onClick={() => setShowPassword((s) => !s)}
                                            >
                                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </button>
                                        }
                                    />
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2">
                                        <LoginField
                                            tile={<Tile icon={ScanText} tone="green" />}
                                            aria-label="Captcha"
                                            placeholder="Enter captcha"
                                            autoComplete="off"
                                            autoCapitalize="off"
                                            spellCheck={false}
                                            maxLength={5}
                                            value={answer}
                                            error={invalid.captcha}
                                            onChange={(e) => setAnswer(e.target.value)}
                                        />
                                        <div className="login-captcha" aria-live="polite">
                                            {captcha ? (
                                                <img src={captcha.image} alt="Security image with 5 characters" className="h-full w-full object-contain" />
                                            ) : (
                                                <span className="ui-spinner ui-spinner--sm" role="status" aria-label="Loading" />
                                            )}
                                        </div>
                                        <IconButton icon={RefreshCw} label="New image" variant="outline" size="lg" className="login-captcha-btn" onClick={newCaptcha} disabled={busy} />
                                    </div>

                                    <Button type="submit" size="lg" fullWidth loading={busy} className="login-submit mt-1">
                                        {busy ? "Verifying credentials…" : "Login"}
                                        {!busy && <ArrowRight size={16} strokeWidth={2.2} aria-hidden />}
                                    </Button>
                                </form>

                                <div className="login-help">
                                    <div className="login-help-links">
                                        {RECOVER.map((h) => (
                                            <button key={h.label} type="button" className="login-help-link" onClick={() => notReady(h.label)}>
                                                <Tile icon={h.icon} tone={h.tone} />
                                                {h.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="login-help-or">New to HIMS Plus?</p>
                                    <button type="button" className="login-request" onClick={() => notReady("Request user ID & password")}>
                                        <Tile icon={UserPlus} tone="green" />
                                        Request user ID &amp; password
                                    </button>
                                </div>

                                <div className="login-secure">
                                    <span className="login-secure-badge" aria-hidden>
                                        <ShieldCheck size={13} strokeWidth={2.4} />
                                    </span>
                                    <p className="min-w-0">Your credentials are encrypted and secure.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Hand-off: the dashboard's background colour wipes out from the card just before the route changes. */}
            {wipeFrom && <div className="login-wipe" aria-hidden style={{ "--wx": `${wipeFrom.x}px`, "--wy": `${wipeFrom.y}px` } as CSSProperties} />}
        </div>
    );
};

export default Login;
