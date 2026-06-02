export function copyWithFeedback(
  button: HTMLElement,
  text: string,
  label: string,
  feedbackIcon = "",
): void {
  navigator.clipboard?.writeText(text);
  button.innerHTML = feedbackIcon ? `Copied ${feedbackIcon}` : "Copied ✓";
  setTimeout(() => {
    button.textContent = label;
  }, 1500);
}
