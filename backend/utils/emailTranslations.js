/**
 * Email translations for meeting notifications
 * Contains translations for subject lines and email content
 */

const translations = {
    english: {
      subject: "Your Google Meet Event Details",
      linkIntro: "Here is your Google Meet event link:",
      date: "Date:",
      time: "Time:",
      timezone: "Timezone:",
      instructions: "Please click the link a few minutes before the scheduled time to join the meeting."
    },
    magyar: {
      subject: "Google Meet esemény részletei",
      linkIntro: "Itt van a Google Meet esemény hivatkozása:",
      date: "Dátum:",
      time: "Időpont:",
      timezone: "Időzóna:",
      instructions: "Kérjük, kattintson a linkre néhány perccel a megbeszélt időpont előtt a csatlakozáshoz."
    },
    romanian: {
      subject: "Detaliile evenimentului Google Meet",
      linkIntro: "Iată linkul evenimentului Google Meet:",
      date: "Data:",
      time: "Ora:",
      timezone: "Fus orar:",
      instructions: "Vă rugăm să faceți clic pe link cu câteva minute înainte de ora programată pentru a vă alătura întâlnirii."
    }
  };
  
  module.exports = { translations };