export const auth: { en: Record<string, string>; sw: Record<string, string> } = {
  en: {
    // Login page
    "auth.login.welcomeBack": "Welcome Back",
    "auth.login.commandCenter": "Strategic Command Center",
    "auth.login.tagline": "Your Bajaji, Your Life. Simplified.",

    // Signup page
    "auth.signup.tagline": "Your Fleet, Your Fortune. Simplified.",
    "auth.signup.title": "Create Your Account",
    "auth.signup.subtitle": "Join the King Bariki Bajaji fleet.",

    // Auth form
    "auth.form.fullName": "Full Name (Jina Kamili)",
    "auth.form.email": "Email Address",
    "auth.form.password": "Password",
    "auth.form.login": "Log In",
    "auth.form.createAccount": "Create Account",
    "auth.form.forgotPassword": "Forgot Password?",
    "auth.form.sending": "Sending...",
    "auth.form.emailConfirmNotice": "Depending on project settings you may need to confirm your email before signing in.",
    "auth.form.termsAgree": "By creating an account you agree to our",
    "auth.form.and": "and",
    "auth.form.termsOfService": "Terms of Service",
    "auth.form.privacyPolicy": "Privacy Policy",

    // Validation
    "auth.validation.nameRequired": "Full name is required.",
    "auth.validation.emailInvalid": "Please enter a valid email address.",
    "auth.validation.passwordMin": "Password must be at least 6 characters.",

    // Toasts
    "auth.toast.enterEmailFirstTitle": "Enter your email first",
    "auth.toast.enterEmailFirstDesc": "Type your email above, then tap Forgot Password.",
    "auth.toast.resetSentTitle": "Reset Email Sent",
    "auth.toast.resetSentDesc": "Check {email} for a link to set a new password.",
    "auth.toast.resetFailedTitle": "Could Not Send Reset Email",
    "auth.toast.authFailedTitle": "Authentication Failed",
    "auth.toast.authFailedDesc": "Invalid email or password.",
    "auth.toast.fullNameRequiredTitle": "Full name required",
    "auth.toast.fullNameRequiredDesc": "Please enter your full name to sign up.",
    "auth.toast.accountCreatedTitle": "Account Created",
    "auth.toast.accountCreatedDesc": "Welcome to King Bariki!",
    "auth.toast.signupFailedTitle": "Signup Failed",
    "auth.toast.signupFailedDesc": "Check your connection or try another email.",

    // Auth guard (email activation gate)
    "auth.guard.activateTitle": "Activate Your Account",
    "auth.guard.activateSentTo": "We've sent an activation link to:",
    "auth.guard.activateCheckInbox": "Please check your inbox (and spam folder) to verify your identity.",
    "auth.guard.verifiedButton": "I have verified my email",
    "auth.guard.resendButton": "Resend activation link",
    "auth.guard.signOutButton": "Sign Out & Start Over",
    "auth.guard.securityProtocol": "Security Protocol Active",
    "auth.guard.resendFailedTitle": "Could not resend",
    "auth.guard.resendSentTitle": "Activation link sent",
  },
  sw: {
    // Login page
    "auth.login.welcomeBack": "Karibu Tena",
    "auth.login.commandCenter": "Kituo cha Amri cha Kimkakati",
    "auth.login.tagline": "Bajaji Yako, Maisha Yako. Rahisi.",

    // Signup page
    "auth.signup.tagline": "Meli Yako, Utajiri Wako. Rahisi.",
    "auth.signup.title": "Fungua Akaunti Yako",
    "auth.signup.subtitle": "Jiunge na meli ya Bajaji ya King Bariki.",

    // Auth form
    "auth.form.fullName": "Jina Kamili",
    "auth.form.email": "Barua Pepe",
    "auth.form.password": "Nenosiri",
    "auth.form.login": "Ingia",
    "auth.form.createAccount": "Fungua Akaunti",
    "auth.form.forgotPassword": "Umesahau Nenosiri?",
    "auth.form.sending": "Inatuma...",
    "auth.form.emailConfirmNotice": "Kutegemeana na mipangilio ya mfumo, huenda ukahitaji kuthibitisha barua pepe yako kabla ya kuingia.",
    "auth.form.termsAgree": "Kwa kufungua akaunti unakubali",
    "auth.form.and": "na",
    "auth.form.termsOfService": "Masharti ya Huduma",
    "auth.form.privacyPolicy": "Sera ya Faragha",

    // Validation
    "auth.validation.nameRequired": "Jina kamili linahitajika.",
    "auth.validation.emailInvalid": "Tafadhali weka barua pepe sahihi.",
    "auth.validation.passwordMin": "Nenosiri linapaswa kuwa na herufi 6 au zaidi.",

    // Toasts
    "auth.toast.enterEmailFirstTitle": "Weka barua pepe yako kwanza",
    "auth.toast.enterEmailFirstDesc": "Andika barua pepe yako hapo juu, kisha bonyeza Umesahau Nenosiri.",
    "auth.toast.resetSentTitle": "Barua Pepe ya Kubadilisha Nenosiri Imetumwa",
    "auth.toast.resetSentDesc": "Angalia {email} kupata kiungo cha kuweka nenosiri jipya.",
    "auth.toast.resetFailedTitle": "Imeshindikana Kutuma Barua Pepe ya Kubadilisha Nenosiri",
    "auth.toast.authFailedTitle": "Uthibitishaji Umeshindwa",
    "auth.toast.authFailedDesc": "Barua pepe au nenosiri si sahihi.",
    "auth.toast.fullNameRequiredTitle": "Jina kamili linahitajika",
    "auth.toast.fullNameRequiredDesc": "Tafadhali weka jina lako kamili ili kujisajili.",
    "auth.toast.accountCreatedTitle": "Akaunti Imefunguliwa",
    "auth.toast.accountCreatedDesc": "Karibu King Bariki!",
    "auth.toast.signupFailedTitle": "Usajili Umeshindwa",
    "auth.toast.signupFailedDesc": "Angalia mtandao wako au jaribu barua pepe nyingine.",

    // Auth guard (email activation gate)
    "auth.guard.activateTitle": "Washa Akaunti Yako",
    "auth.guard.activateSentTo": "Tumetuma kiungo cha kuwasha akaunti kwa:",
    "auth.guard.activateCheckInbox": "Tafadhali angalia barua pepe yako (na folda ya spam) kuthibitisha utambulisho wako.",
    "auth.guard.verifiedButton": "Nimethibitisha barua pepe yangu",
    "auth.guard.resendButton": "Tuma tena kiungo cha kuwasha akaunti",
    "auth.guard.signOutButton": "Toka na Uanze Upya",
    "auth.guard.securityProtocol": "Ulinzi wa Usalama Umewashwa",
    "auth.guard.resendFailedTitle": "Imeshindikana kutuma tena",
    "auth.guard.resendSentTitle": "Kiungo cha kuwasha akaunti kimetumwa",
  },
};
