import historyScreen from "../../assets/History.jpg";
import planCreatorScreen from "../../assets/PlanCreator.png";
import planCreatorLightScreen from "../../assets/PlanCreatorLight.png";
import planScreen from "../../assets/Plan.jpg";
import membersScreen from "../../assets/Podopieczni.png";
import membersLightScreen from "../../assets/PodopieczniLight.png";
import reportsScreen from "../../assets/Raports.png";
import reportsLightScreen from "../../assets/RaportsLight.png";
import startScreen from "../../assets/Start.jpg";
import trainingScreen from "../../assets/Training.jpg";
import type { EloShowcase, PreviewScreen, TrainerScreenSlot } from "./types";

export const heroScreens = [
  { image: trainingScreen, alt: "LGYM active training screen" },
  { image: planScreen, alt: "LGYM training plan screen" },
];

export const athleteScreens: PreviewScreen[] = [
  { kickerKey: "landing.productSections.athletes.screens.start.kicker", titleKey: "landing.productSections.athletes.screens.start.title", image: startScreen },
  { kickerKey: "landing.productSections.athletes.screens.plan.kicker", titleKey: "landing.productSections.athletes.screens.plan.title", image: planScreen },
  { kickerKey: "landing.productSections.athletes.screens.training.kicker", titleKey: "landing.productSections.athletes.screens.training.title", image: trainingScreen },
  { kickerKey: "landing.productSections.athletes.screens.history.kicker", titleKey: "landing.productSections.athletes.screens.history.title", image: historyScreen },
];

export const trainerScreenSlotSources: TrainerScreenSlot[] = [
  {
    kickerKey: "landing.productSections.trainers.screens.members.kicker",
    titleKey: "landing.productSections.trainers.screens.members.title",
    placeholderKey: "landing.productSections.trainers.screens.members.placeholder",
    descriptionKey: "landing.productSections.trainers.screens.members.description",
    darkImage: membersScreen,
    lightImage: membersLightScreen,
  },
  {
    kickerKey: "landing.productSections.trainers.screens.plans.kicker",
    titleKey: "landing.productSections.trainers.screens.plans.title",
    placeholderKey: "landing.productSections.trainers.screens.plans.placeholder",
    descriptionKey: "landing.productSections.trainers.screens.plans.description",
    darkImage: planCreatorScreen,
    lightImage: planCreatorLightScreen,
  },
  {
    kickerKey: "landing.productSections.trainers.screens.reports.kicker",
    titleKey: "landing.productSections.trainers.screens.reports.title",
    placeholderKey: "landing.productSections.trainers.screens.reports.placeholder",
    descriptionKey: "landing.productSections.trainers.screens.reports.description",
    darkImage: reportsScreen,
    lightImage: reportsLightScreen,
  },
];

export const socialLinks = [
  { labelKey: "landing.socials.links.instagram.label", icon: "mdi mdi-instagram", descriptionKey: "landing.socials.links.instagram.description", href: "https://www.instagram.com/" },
  { labelKey: "landing.socials.links.tiktok.label", icon: "mdi mdi-music-note-eighth", descriptionKey: "landing.socials.links.tiktok.description", href: "https://www.tiktok.com/" },
];

export const metrics = [
  { valueKey: "landing.metrics.roles.value", labelKey: "landing.metrics.roles.label" },
  { valueKey: "landing.metrics.system.value", labelKey: "landing.metrics.system.label" },
  { valueKey: "landing.metrics.access.value", labelKey: "landing.metrics.access.label" },
];

export const panelRows = [
  "landing.hero.panel.rows.members",
  "landing.hero.panel.rows.plans",
  "landing.hero.panel.rows.reports",
];

export const features = [
  { icon: "01", key: "plan" },
  { icon: "02", key: "history" },
  { icon: "03", key: "collaboration" },
];

export const eloShowcase: EloShowcase = {
  kickerKey: "landing.showcase.elo.kicker",
  titleKey: "landing.showcase.elo.title",
  descriptionKey: "landing.showcase.elo.description",
  image: startScreen,
};

export const audiences = ["mobile", "web", "platform"];
