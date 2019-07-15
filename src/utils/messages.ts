export function getMessageForAddonsDescription(
    hasEvents: boolean, hasLandmarks: boolean, hasProjects: boolean) {
  if (hasEvents && hasLandmarks && hasProjects) {
    return "Events, Landmarks and Projects";
  }
  if (hasEvents && hasLandmarks) {
    return "Events and Landmarks";
  }
  if (hasEvents && hasProjects) {
    return "Events and Projects";
  }
  if (hasLandmarks && hasProjects) {
    return "Landmarks and Projects";  
  }
  if (hasEvents) {
    return "Events";  
  }
  if (hasLandmarks) {
    return "Landmarks";
  }
  if (hasProjects) {
    return "Projects";
  }
  return "";
}