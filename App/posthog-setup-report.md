<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this React Router v6 + Vite application. Here is a summary of all changes made:

**Initialization** (`src/main.tsx`): PostHog is initialized with `posthog.init()` using environment variables. The app is wrapped with `PostHogProvider` (for React hook access) and `PostHogErrorBoundary` (automatic unhandled error capture).

**Environment variables** (`.env`): `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` added and covered by `.gitignore`.

**TypeScript types** (`src/vite-env.d.ts`): `ImportMetaEnv` interface extended with PostHog and API env var types.

**User identification**: On email login (`LoginPage.tsx`), `posthog.identify()` is called with the user's ID and email. On registration (`RegisterPage.tsx`), `posthog.identify()` is called with email and profile data. On logout (`useLogout.tsx`), `posthog.reset()` is called to clear the identity.

**Error tracking**: `posthog.captureException()` is called in all catch blocks across login, registration, contact form, send mail, and forgot password flows.

## Events tracked

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully logged in with email and password | `src/OuterApp/LoginPage.tsx` |
| `user_signed_in_with_google` | User clicked Continue with Google on the login page | `src/OuterApp/LoginPage.tsx` |
| `user_signed_in_with_facebook` | User clicked Continue with Facebook on the login page | `src/OuterApp/LoginPage.tsx` |
| `user_signed_up` | User successfully registered a new account with email | `src/OuterApp/RegisterPage.tsx` |
| `user_signed_up_with_google` | User clicked Continue with Google on the register page | `src/OuterApp/RegisterPage.tsx` |
| `user_signed_up_with_facebook` | User clicked Continue with Facebook on the register page | `src/OuterApp/RegisterPage.tsx` |
| `user_logged_out` | User logged out and was redirected to login | `src/hooks/useLogout.tsx` |
| `contact_form_submitted` | Visitor successfully submitted the public contact form | `src/OuterApp/ContactForm.tsx` |
| `email_sent` | User successfully sent an internal email via the mailing system | `src/hooks/useSendMail.tsx` |
| `booking_confirmation_viewed` | User landed on the booking confirmation page after booking a meeting | `src/OuterApp/BookingConfirmation.tsx` |
| `forgot_password_requested` | User submitted their email to receive a password reset code | `src/OuterApp/ForgotPasswordPage.tsx` |
| `password_reset_completed` | User successfully reset their password using a reset code | `src/OuterApp/ForgotPasswordPage.tsx` |
| `kanban_card_added` | User clicked Add Card to add a new card to a kanban column | `src/InnerApp/Kanban/Column.tsx` |
| `kanban_column_deleted` | User confirmed deletion of a kanban column | `src/InnerApp/Kanban/Column.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/673986)
- [New sign-ups over time](/insights/YXfHTMLt) — daily unique users who registered
- [Daily logins](/insights/IOAJw6UM) — daily unique users who signed in
- [Sign-up to booking conversion funnel](/insights/NdbGAkG5) — conversion from registration → login → booking confirmed
- [Booking confirmations viewed](/insights/UIySpnE8) — total landing on the booking confirmation page per day
- [User churn: logouts over time](/insights/z17EI7Pk) — weekly unique users logging out

> **Note:** Run `npm add posthog-js @posthog/react` to install the PostHog packages before starting the dev server. This was prepared during the wizard run but could not be completed automatically.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-react-react-router-6/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
