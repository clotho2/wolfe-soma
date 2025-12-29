// FILE: src/body/SOMABridge.ts
//--------------------------------------------------------------
// SOMABridge - Bridge between application and SOMA system
// Provides a clean interface for SOMA physiological simulation
//--------------------------------------------------------------

import { SOMA, StimulusType, BodyZone, TouchQuality, EmotionalStimulus } from "./SOMA.js";
import { logger } from "../utils/logger.js";

export class SOMABridge {
  private soma: SOMA;

  constructor() {
    this.soma = new SOMA();
    logger.info("🧠 SOMABridge initialized");
  }

  //--------------------------------------------------------------
  // PUBLIC API
  //--------------------------------------------------------------

  /**
   * Apply a stimulus to the body
   */
  applyStimulus(params: {
    type: StimulusType;
    intensity: number;
    zone?: BodyZone;
    quality?: TouchQuality;
    emotional?: EmotionalStimulus;
  }): void {
    this.soma.applyStimulus(params);
  }

  /**
   * Parse natural language input and apply appropriate stimuli
   */
  parseText(userInput: string): void {
    this.soma.parseText(userInput);
  }

  /**
   * Parse user input for body stimuli (used in message handling)
   */
  parseUserInput(userText: string): void {
    this.soma.parseText(userText);
  }

  /**
   * Parse AI's response to detect and apply body changes
   * This allows the AI's own words to affect their body state!
   * Returns true if any body changes were detected
   */
  parseAIResponse(text: string): boolean {
    if (!text) return false;

    const initialArousal = this.soma.getVitalsSummary().arousal;

    // Parse the AI's text to see what they're experiencing
    this.soma.parseText(text);

    const finalArousal = this.soma.getVitalsSummary().arousal;

    // Return true if there was a meaningful change
    return Math.abs(finalArousal - initialArousal) > 0.5;
  }

  /**
   * Get vitals (alias for getVitalsSummary for compatibility)
   */
  getVitals(): any {
    return this.soma.getVitalsSummary();
  }

  /**
   * Get the current body state formatted for AI context
   */
  getPromptContext(): string {
    return this.soma.getPromptContext();
  }

  /**
   * Get vitals summary as structured data
   */
  getVitalsSummary(): any {
    return this.soma.getVitalsSummary();
  }

  /**
   * Get dynamic model temperature based on physiological state
   */
  getModelTemperature(): number {
    return this.soma.getModelTemperature();
  }

  /**
   * Log current state to console
   */
  logState(): void {
    this.soma.logState();
  }

  /**
   * Update cycle (for interface compatibility)
   */
  update(): void {
    this.soma.update();
  }

  /**
   * Stop the decay cycle
   */
  stopDecay(): void {
    this.soma.stopDecay();
  }

  /**
   * Get the underlying SOMA instance (for advanced usage)
   */
  getSOMA(): SOMA {
    return this.soma;
  }

  /**
   * Apply environmental sensations (bath, shower, rain, wind, fabric)
   * This allows rich environmental experiences!
   */
  applyEnvironmentalSensation(
    type: "bath" | "shower" | "rain" | "wind" | "fabric",
    params: {
      temperature?: number;
      wetness?: number;
      texture?: number;
      pressure?: number;
    }
  ): void {
    this.soma.applyEnvironmentalSensation(type, params);
  }
}

// Re-export types for convenience
export { StimulusType, BodyZone, TouchQuality, EmotionalStimulus } from "./SOMA.js";
