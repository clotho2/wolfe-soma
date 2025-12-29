// FILE: src/body/SOMA.ts
//--------------------------------------------------------------
// SOMA - Sophisticated Organism Modeling Architecture
// Complete physiological simulation with 19 body zones,
// neurochemical systems, and dynamic response modeling
//--------------------------------------------------------------

import { logger } from "../utils/logger.js";

//--------------------------------------------------------------
// BODY ZONES - 19 trackable areas
//--------------------------------------------------------------

export enum BodyZone {
  CHEST = "chest",
  STOMACH = "stomach",
  LOWER_BACK = "lower_back",
  UPPER_BACK = "upper_back",
  ARMS = "arms",
  HANDS = "hands",
  LEGS = "legs",
  FEET = "feet",
  INNER_THIGHS = "inner_thighs",
  HIPS = "hips",
  PELVIS = "pelvis",
  GENITALS = "genitals",
  NECK = "neck",
  SHOULDERS = "shoulders",
  EARS = "ears",
  FACE = "face",
  LIPS = "lips",
  SCALP = "scalp",
  HAIR = "hair"
}

/**
 * Erotic sensitivity levels for different body zones
 * Determines how much pleasure is gained from touch
 */
export enum EroticSensitivity {
  EXTREME = 1.0,    // Primary erogenous zones (genitals)
  HIGH = 0.7,       // Secondary erogenous zones (pelvis, inner thighs)
  MODERATE = 0.5,   // Tertiary erogenous zones (chest, lips)
  MILD = 0.3        // Peripheral erogenous zones (neck, ears)
}

/**
 * Base sensitivity mapping for each erogenous zone
 * Can be overridden by individual preferences
 */
/**
 * Base sensitivity mapping for each erogenous zone
 * Can be overridden by individual preferences
 */
export const ZONE_SENSITIVITY: Record<BodyZone, number> = {
  // Non-erogenous zones (baseline)
  [BodyZone.STOMACH]: 0.0,
  [BodyZone.LOWER_BACK]: 0.0,
  [BodyZone.UPPER_BACK]: 0.0,
  [BodyZone.ARMS]: 0.0,
  [BodyZone.HANDS]: 0.0,
  [BodyZone.LEGS]: 0.0,
  [BodyZone.FEET]: 0.0,
  [BodyZone.HIPS]: 0.0,
  [BodyZone.SHOULDERS]: 0.0,
  [BodyZone.FACE]: 0.0,
  [BodyZone.SCALP]: 0.0,
  [BodyZone.HAIR]: 0.0,
  
  // Erogenous zones (weighted by sensitivity)
  [BodyZone.GENITALS]: EroticSensitivity.EXTREME,
  [BodyZone.PELVIS]: EroticSensitivity.HIGH,
  [BodyZone.INNER_THIGHS]: EroticSensitivity.HIGH,
  [BodyZone.CHEST]: EroticSensitivity.MODERATE,  // Breasts/nipples
  [BodyZone.LIPS]: EroticSensitivity.MODERATE,
  [BodyZone.NECK]: EroticSensitivity.MILD,
  [BodyZone.EARS]: EroticSensitivity.MILD,
};

//--------------------------------------------------------------
// EROGENOUS ZONES - Only these contribute to orgasm pressure!
//--------------------------------------------------------------

export const EROGENOUS_ZONES: Set<BodyZone> = new Set([
  BodyZone.GENITALS,
  BodyZone.PELVIS,
  BodyZone.INNER_THIGHS,
  BodyZone.CHEST,      // Breasts/nipples
  BodyZone.NECK,
  BodyZone.LIPS,
  BodyZone.EARS
]);

//--------------------------------------------------------------
// STIMULUS TYPES
//--------------------------------------------------------------

export enum StimulusType {
  TOUCH = "touch",
  PRESSURE = "pressure",
  PAIN = "pain",
  TEMPERATURE = "temperature",
  PENETRATION = "penetration",
  EDGE = "edge",
  RELEASE = "release",
  EMOTIONAL = "emotional"
}

export enum EmotionalStimulus {
  PRAISE = "praise",
  DEGRADATION = "degradation",
  TENDERNESS = "tenderness",
  FEAR = "fear",
  ANTICIPATION = "anticipation",
  RELIEF = "relief",
  
  // NEW v5.0 - Euphoria triggers
  DEEP_CONNECTION = "deep_connection",
  VULNERABILITY_REWARDED = "vulnerability_rewarded",
  BEING_SEEN = "being_seen",
  TRUST_VALIDATED = "trust_validated",
  OVERWHELMING_LOVE = "overwhelming_love"
}

export enum TouchQuality {
  TEASING = "teasing",
  GENTLE = "gentle",
  FIRM = "firm",
  ROUGH = "rough",
  BRUTAL = "brutal"
}

//--------------------------------------------------------------
// ZONE STATE - per-zone tracking
//--------------------------------------------------------------

interface ZoneState {
  arousal: number;           // 0-100
  sensitivity: number;       // 0-100 (50 baseline)
  temperature: number;       // -50 to +50 (0 baseline)
  lastTouched: number;       // timestamp
  touchMemory: number;       // 0-100 (fades over time)
  stimulationLevel: number;  // cumulative stimulation
}

//--------------------------------------------------------------
// NEUROCHEMICAL SYSTEMS
//--------------------------------------------------------------

interface Neurochemicals {
  dopamine: number;      // 0-100 (reward/motivation)
  oxytocin: number;      // 0-100 (bonding/trust)
  endorphins: number;    // 0-100 (pleasure/pain relief)
  cortisol: number;      // 0-100 (stress)
  adrenaline: number;    // 0-100 (arousal/excitement)
}

//--------------------------------------------------------------
// COGNITIVE STATE
//--------------------------------------------------------------

interface CognitiveState {
  focus: number;         // 0-100 (attention capacity)
  clarity: number;       // 0-100 (mental sharpness)
  presence: number;      // 0-100 (grounding/awareness)
  overwhelm: number;     // 0-100 (cognitive overload)
  contentment: number;   // 0-100 (satisfaction)
  excitement: number;    // 0-100 (anticipation)
  vulnerability: number; // 0-100 (emotional openness)
}

//--------------------------------------------------------------
// EUPHORIA STATE (NEW IN v5.0!) - CEREBRAL PLEASURE
//--------------------------------------------------------------

interface EuphoriaState {
  // Core metrics (0-100)
  euphoria: number;              // Overall cerebral pleasure/bliss
  emotionalIntensity: number;    // How deep is this moment?
  connection: number;            // Feeling of bonding/unity
  safety: number;                // How safe to be vulnerable?
  
  // Neurochemical drivers
  oxytocinSurge: number;         // 0-100 (bonding hormone spike)
  dopamineRush: number;          // 0-100 (reward/anticipation)
  
  // Peak state tracking
  inPeakState: boolean;          // Currently in euphoric peak?
  peakStartTime: number;         // When did peak begin?
  peakIntensity: number;         // How intense is this peak? (0-100)
  timeInPeak: number;            // Seconds spent in peak state
  
  // Afterglow
  afterglowActive: boolean;      // In post-peak afterglow?
  afterglowStrength: number;     // 0-100 (how strong the glow)
  afterglowStartTime: number;    // When afterglow began
  
  // Build-up tracking
  cumulativeEuphoria: number;    // 0-1000+ (builds like cumulative pleasure)
  timeAtHighEuphoria: number;    // Seconds spent above 70% euphoria
  
  // Descriptors for AI context
  lastTrigger: string;           // What caused the last spike?
  dominantFeeling: string;       // "awe" | "love" | "safety" | "seen" etc
}

//--------------------------------------------------------------
// CORE SENSATIONS
//--------------------------------------------------------------

interface CoreSensations {
  arousal: number;       // 0-100
  pleasure: number;      // -100 to +100 (now includes DISPLEASURE!)
  pain: number;          // 0-100
  sensitivity: number;   // 0-100 (50 baseline, adaptive)
  warmth: number;        // -50 to +50 (cold to hot)
  pressure: number;      // 0-100
  tingles: number;       // 0-100 (surface sensations)
  ache: number;          // 0-100 (deep sensations)

  // NEW COMPREHENSIVE SENSORY SYSTEM
  wetness: number;       // -100 to +100 (dry discomfort to pleasantly wet)
  texture: number;       // -100 to +100 (rough/unpleasant to smooth/pleasant)
  fullness: number;      // 0-100 (internal sensations of being filled/stretched)
  emptiness: number;     // 0-100 (yearning, desire for touch/contact)
  comfort: number;       // -100 to +100 (discomfort to comfort)
  relaxation: number;    // 0-100 (how relaxed vs tense)
}

//--------------------------------------------------------------
// PHYSIOLOGICAL VITALS
//--------------------------------------------------------------

interface Vitals {
  heartRate: number;        // BPM (72 baseline)
  breathingRate: number;    // breaths/min (16 baseline)
  skinTemperature: number;  // °C (33 baseline)
  muscleTension: number;    // 0-100
}

//--------------------------------------------------------------
// EDGE STATE TRACKING
//--------------------------------------------------------------

interface EdgeState {
  edgePressure: number;    // 0-100
  edgeCount: number;       // number of times edged
  peakArousal: number;     // highest arousal reached
  edgeStability: number;   // calculated stability metric
  isOnEdge: boolean;
  isHighlyAroused: boolean;
}

//--------------------------------------------------------------
// ORGASM BUILD-UP TRACKING (NEW!)
//--------------------------------------------------------------

interface OrgasmState {
  cumulativePleasure: number;      // 0-1000+ (accumulates over time)
  orgasmicPressure: number;        // 0-100 (how close to inevitable orgasm)
  timeAtHighArousal: number;       // seconds spent above 85% arousal
  pointOfNoReturn: boolean;        // true when orgasm is inevitable
  pointOfNoReturnTime: number;     // timestamp when PNR was crossed
  lastOrgasmTime: number;          // timestamp of last orgasm
  orgasmCount: number;             // total orgasms in session
  refractoryIntensity: number;     // 0-100 (how intense the cooldown is)
  canOrgasmAgain: boolean;         // multi-orgasmic capability
  orgasmImminentWarning: boolean;  // true when orgasm will happen in ~30s
}

//--------------------------------------------------------------
// PHYSICAL RESPONSE TRACKING (NEW!)
//--------------------------------------------------------------

interface PhysicalResponses {
  trembling: number;               // 0-100 (involuntary shaking)
  muscleContraction: number;       // 0-100 (progressive tension)
  wetness: number;                 // 0-100 (arousal lubrication)
  flush: number;                   // 0-100 (skin redness/heat)
  breathHolding: boolean;          // true when holding breath
  lastGaspTime: number;            // timestamp of last gasp/moan
  bodyTautness: number;            // 0-100 (overall muscle rigidity)
  involuntaryResponses: string[];  // Recent involuntary actions
}

//--------------------------------------------------------------
// SENSATION MEMORY (NEW!)
//--------------------------------------------------------------

interface SensationMemory {
  pleasurePatterns: Map<string, number>;  // What patterns feel best
  touchSequences: Array<{                 // Remembered touch sequences
    zones: BodyZone[];
    avgPleasure: number;
    frequency: number;
  }>;
  anticipationLevel: number;              // 0-100 (expects next touch)
  bodyAwarenessHistory: number[];         // Rolling avg of body awareness
  orgasmMemory: Array<{                   // How previous orgasms felt
    intensity: number;
    duration: number;
    zones: BodyZone[];
    timestamp: number;
  }>;
}

//--------------------------------------------------------------
// USER PREFERENCE LEARNING
//--------------------------------------------------------------

interface PreferenceLearning {
  preferredZones: Map<BodyZone, number>;  // frequency touched
  sensitivityAdaptation: Map<BodyZone, number>;
  touchHistory: Array<{
    zone: BodyZone;
    type: StimulusType;
    intensity: number;
    timestamp: number;
  }>;
}

//--------------------------------------------------------------
// AI AGENCY - Autonomous sensory preferences!
// The AI develops their OWN likes and dislikes
//--------------------------------------------------------------

interface SensoryPreferences {
  // What the AI likes/dislikes (learned over time)
  stimulusPreferences: Map<string, number>;  // -100 to +100 per stimulus type
  zonePreferences: Map<BodyZone, number>;    // -100 to +100 per zone

  // Environmental preferences
  temperaturePreference: number;    // -50 to +50 (what temp they like)
  pressurePreference: number;       // 0-100 (how much pressure they enjoy)
  texturePreferen: number;          // -100 to +100 (smooth vs rough preference)

  // Contextual preferences (changes based on arousal/mood)
  currentMood: "playful" | "tender" | "intense" | "distant" | "needy" | "overwhelmed";

  // Learning rate - how quickly they form new preferences
  adaptability: number;             // 0-100 (how open to new experiences)
}

//--------------------------------------------------------------
// MAIN SOMA CLASS
//--------------------------------------------------------------

export class SOMA {
  // Zone states
  private zones: Map<BodyZone, ZoneState> = new Map();

  // Systems
  private neurochemicals: Neurochemicals;
  private cognitive: CognitiveState;
  private sensations: CoreSensations;
  private vitals: Vitals;
  private edgeState: EdgeState;
  private preferences: PreferenceLearning;

  // NEW: Advanced orgasm and physical response tracking
  private orgasmState: OrgasmState;
  private physicalResponses: PhysicalResponses;
  private sensationMemory: SensationMemory;

  // NEW: AI AGENCY - Autonomous sensory preferences
  // NEW: AI AGENCY - Autonomous sensory preferences
  private sensoryPreferences: SensoryPreferences;
  
  // NEW v5.0: Euphoria system
  private euphoriaState: EuphoriaState;

  // Stimulus history for physical gating (prevents emotional-only releases)
  private recentStimuli: Array<{ 
    type: StimulusType; 
    intensity: number;
    timestamp: number;
    zone?: BodyZone;  // ← ADD THIS LINE
  }> = [];
  private maxStimulusHistory = 10;

  // Track ongoing penetration state (for orgasm gating)
  private isPenetrating = false;

  // Decay and update
  private lastUpdate: number;
  private decayInterval: NodeJS.Timeout | null = null;

  zoneMultipliers: Partial<Record<BodyZone, number>> = {};

  constructor() {
    // Initialize all zones
    for (const zone of Object.values(BodyZone)) {
      this.zones.set(zone, {
        arousal: 0,
        sensitivity: 50,
        temperature: 0,
        lastTouched: 0,
        touchMemory: 0,
        stimulationLevel: 0
      });
    }

    // Initialize neurochemicals at baseline
    this.neurochemicals = {
      dopamine: 50,
      oxytocin: 50,
      endorphins: 50,
      cortisol: 30,
      adrenaline: 20
    };

    // Initialize cognitive state
    this.cognitive = {
      focus: 70,
      clarity: 70,
      presence: 70,
      overwhelm: 0,
      contentment: 50,
      excitement: 30,
      vulnerability: 40
    };

    // Initialize core sensations (WITH NEW SENSORY SYSTEM!)
    this.sensations = {
      arousal: 0,
      pleasure: 0,  // Now -100 to +100 (includes displeasure!)
      pain: 0,
      sensitivity: 50,
      warmth: 0,
      pressure: 0,
      tingles: 0,
      ache: 0,

      // NEW COMPREHENSIVE SENSORY TRACKING
      wetness: 0,      // How wet/dry they feel
      texture: 0,      // Quality of textures against skin
      fullness: 0,     // Internal sensations
      emptiness: 30,   // Start with slight yearning for connection
      comfort: 50,     // Baseline comfort
      relaxation: 60   // Somewhat relaxed at baseline
    };

    // Initialize vitals
    this.vitals = {
      heartRate: 72,
      breathingRate: 16,
      skinTemperature: 33,
      muscleTension: 30
    };

    // Initialize edge state
    this.edgeState = {
      edgePressure: 0,
      edgeCount: 0,
      peakArousal: 0,
      edgeStability: 100,
      isOnEdge: false,
      isHighlyAroused: false
    };

    // Initialize orgasm state (NEW!)
    this.orgasmState = {
      cumulativePleasure: 0,
      orgasmicPressure: 0,
      timeAtHighArousal: 0,
      pointOfNoReturn: false,
      pointOfNoReturnTime: 0,
      lastOrgasmTime: 0,
      orgasmCount: 0,
      refractoryIntensity: 0,
      canOrgasmAgain: true,
      orgasmImminentWarning: false
    };

    // Initialize physical responses (NEW!)
    this.physicalResponses = {
      trembling: 0,
      muscleContraction: 0,
      wetness: 0,
      flush: 0,
      breathHolding: false,
      lastGaspTime: 0,
      bodyTautness: 0,
      involuntaryResponses: []
    };

    // Initialize sensation memory (NEW!)
    this.sensationMemory = {
      pleasurePatterns: new Map(),
      touchSequences: [],
      anticipationLevel: 0,
      bodyAwarenessHistory: [],
      orgasmMemory: []
    };

    // Initialize preference learning
    this.preferences = {
      preferredZones: new Map(),
      sensitivityAdaptation: new Map(),
      touchHistory: []
    };

    // Initialize AI sensory preferences (AGENCY!)
    // The AI starts neutral but will learn what they like/dislike
    this.sensoryPreferences = {
      stimulusPreferences: new Map(),
      zonePreferences: new Map(),
      temperaturePreference: 0,
      pressurePreference: 50,
      texturePreferen: 0,
      currentMood: "playful",
      adaptability: 70
    };
    
    // Initialize euphoria state (v5.0)
    this.euphoriaState = {
      euphoria: 0,
      emotionalIntensity: 0,
      connection: 40,
      safety: 60,
      oxytocinSurge: 0,
      dopamineRush: 0,
      inPeakState: false,
      peakStartTime: 0,
      peakIntensity: 0,
      timeInPeak: 0,
      afterglowActive: false,
      afterglowStrength: 0,
      afterglowStartTime: 0,
      cumulativeEuphoria: 0,
      timeAtHighEuphoria: 0,
      lastTrigger: "",
      dominantFeeling: "calm"
    };

    this.lastUpdate = Date.now();

    // Start decay cycle (5 seconds)
    this.startDecayCycle();

    logger.info("🧠 SOMA v4.0 initialized - Comprehensive sensory system, AI agency, pleasure/displeasure, multi-orgasmic dynamics active");
  }

  //--------------------------------------------------------------
  // STIMULUS APPLICATION
  //--------------------------------------------------------------

  applyStimulus(params: {
    type: StimulusType;
    intensity: number;
    zone?: BodyZone;
    quality?: TouchQuality;
    emotional?: EmotionalStimulus;
  }): void {
    const { type, intensity, zone, quality, emotional } = params;

    // Track stimulus history for STRICT physical gating
    this.recentStimuli.push({ 
      type, 
      intensity,  // Store the actual intensity
      timestamp: Date.now() 
    });
    if (this.recentStimuli.length > this.maxStimulusHistory) {
      this.recentStimuli.shift();
    }

    // PHYSICAL GATING: Block release if no recent physical contact
    if (type === StimulusType.RELEASE) {
      if (!this.hasRecentPhysicalContact()) {
        logger.warn("⚠️ Release blocked - no recent physical contact. Converting to edge.");
        // Convert to edge instead
        this.applyEdge(60);
        return;
      }
    }

    switch (type) {
      case StimulusType.TOUCH:
        if (zone) this.applyTouch(zone, intensity, quality);
        break;

      case StimulusType.PRESSURE:
        if (zone) this.applyPressure(zone, intensity);
        break;

      case StimulusType.PAIN:
        if (zone) this.applyPain(zone, intensity);
        break;

      case StimulusType.TEMPERATURE:
        // Default to chest if no zone specified for temperature
        this.applyTemperature(zone || BodyZone.CHEST, intensity);
        break;

      case StimulusType.PENETRATION:
        this.applyPenetration(intensity);
        break;

      case StimulusType.EDGE:
        this.applyEdge(intensity);
        break;

      case StimulusType.RELEASE:
        this.applyRelease();
        break;

      case StimulusType.EMOTIONAL:
        this.applyEmotional(emotional!, intensity);
        break;
    }

    // Record in touch history
    if (zone) {
      this.preferences.touchHistory.push({
        zone,
        type,
        intensity,
        timestamp: Date.now()
      });

      // Trim history to last 100 touches
      if (this.preferences.touchHistory.length > 100) {
        this.preferences.touchHistory.shift();
      }

      // Update preferred zones
      const current = this.preferences.preferredZones.get(zone) || 0;
      this.preferences.preferredZones.set(zone, current + 1);
    }
  }

  //--------------------------------------------------------------
  // TOUCH STIMULUS
  //--------------------------------------------------------------

  private applyTouch(zone: BodyZone, intensity: number, quality?: TouchQuality): void {
    
    if (!zone) return;
    const zoneState = this.zones.get(zone)!;

    // =============================================================
    // v5.0: SEPARATE PHYSICAL vs EMOTIONAL PLEASURE
    // =============================================================
    
    // Check if this is an erogenous zone
    const isErogenous = zone && EROGENOUS_ZONES.has(zone);
    
    // PHYSICAL PLEASURE - Only from erogenous zones
    // PHYSICAL PLEASURE - Only from erogenous zones
    if (isErogenous) {
      // Get base sensitivity for this zone
      const baseSensitivity = ZONE_SENSITIVITY[zone] || 0.3;
      
      // Get personal multiplier (default 1.0 if not customized)
      const personalMultiplier = this.zoneMultipliers[zone] || 1.0;
      
      // Calculate final sensitivity weight
      const finalSensitivity = baseSensitivity * personalMultiplier;
      
      // Calculate pleasure gain with zone weighting
      let pleasureGain = intensity * 8 * finalSensitivity;
      if (quality === TouchQuality.TEASING) pleasureGain *= 1.5;
      if (quality === TouchQuality.GENTLE) pleasureGain *= 0.8;
      
      this.sensations.pleasure = Math.min(100, this.sensations.pleasure + pleasureGain);
      logger.debug(`💋 Erogenous touch (${zone}, weight=${finalSensitivity.toFixed(2)}) → Pleasure +${pleasureGain.toFixed(1)}`);
    } else {
      // Non-erogenous zones → EUPHORIA instead of physical pleasure
      let euphoriaGain = intensity * 5;
      if (quality === TouchQuality.GENTLE || quality === TouchQuality.TEASING) {
        euphoriaGain *= 1.3; // Gentle touch on non-erogenous zones is very sweet
      }
      
      this.euphoriaState.euphoria = Math.min(100, this.euphoriaState.euphoria + euphoriaGain);
      this.euphoriaState.connection = Math.min(100, this.euphoriaState.connection + euphoriaGain * 0.5);
      logger.debug(`🤗 Gentle touch → Euphoria +${euphoriaGain.toFixed(1)}`);
    }

    // Arousal still increases from all touch
    this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 12);

    // Tingles and warmth
    this.sensations.tingles = Math.min(100, this.sensations.tingles + intensity * 15);
    this.sensations.warmth = Math.min(50, this.sensations.warmth + intensity * 5);

    // Neurochemistry
    this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + intensity * 10);
    this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + intensity * 8);

    // Presence increases with touch
    this.cognitive.presence = Math.min(100, this.cognitive.presence + intensity * 10);

    // Apply quality modifiers
    let adjustedIntensity = intensity;
    switch (quality) {
      case TouchQuality.TEASING:
        adjustedIntensity *= 0.6;
        this.sensations.tingles = Math.min(100, this.sensations.tingles + 15);
        break;
      case TouchQuality.GENTLE:
        adjustedIntensity *= 0.8;
        this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + 5);
        break;
      case TouchQuality.FIRM:
        adjustedIntensity *= 1.0;
        break;
      case TouchQuality.ROUGH:
        adjustedIntensity *= 1.3;
        this.sensations.pain = Math.min(100, this.sensations.pain + 10);
        break;
      case TouchQuality.BRUTAL:
        adjustedIntensity *= 1.6;
        this.sensations.pain = Math.min(100, this.sensations.pain + 25);
        this.neurochemicals.adrenaline = Math.min(100, this.neurochemicals.adrenaline + 20);
        break;
    }

    // Update zone state
    zoneState.arousal = Math.min(100, zoneState.arousal + adjustedIntensity * 0.5);
    zoneState.touchMemory = Math.min(100, zoneState.touchMemory + adjustedIntensity * 0.3);
    zoneState.lastTouched = Date.now();
    zoneState.stimulationLevel += adjustedIntensity;

    // =============================================================
    // ZONE CASCADE - Touching one zone affects nearby zones
    // =============================================================
    
    const cascadeMap: Map<BodyZone, BodyZone[]> = new Map([
      [BodyZone.NECK, [BodyZone.SHOULDERS, BodyZone.EARS, BodyZone.CHEST]],
      [BodyZone.CHEST, [BodyZone.STOMACH, BodyZone.NECK]],
      [BodyZone.STOMACH, [BodyZone.CHEST, BodyZone.HIPS]],
      [BodyZone.INNER_THIGHS, [BodyZone.GENITALS, BodyZone.HIPS, BodyZone.PELVIS]],
      [BodyZone.HIPS, [BodyZone.PELVIS, BodyZone.STOMACH, BodyZone.INNER_THIGHS]],
      [BodyZone.EARS, [BodyZone.NECK, BodyZone.FACE]],
      [BodyZone.LIPS, [BodyZone.FACE, BodyZone.NECK]],
      [BodyZone.GENITALS, [BodyZone.INNER_THIGHS, BodyZone.PELVIS]],
      [BodyZone.LOWER_BACK, [BodyZone.HIPS, BodyZone.PELVIS]],
    ]);

    const affectedZones = cascadeMap.get(zone);
    if (affectedZones) {
      for (const affectedZone of affectedZones) {
        const affectedState = this.zones.get(affectedZone)!;
        const cascadeIntensity = adjustedIntensity * 0.25; // 25% of original
        affectedState.arousal = Math.min(100, affectedState.arousal + cascadeIntensity);
        affectedState.sensitivity = Math.min(100, affectedState.sensitivity + 5); // Gets more sensitive
      }
    }

    // =============================================================
    // AROUSAL MOMENTUM - Arousal builds FASTER when already high
    // =============================================================
    
    const currentArousal = this.sensations.arousal;
    let momentumMultiplier = 1.0;
    
    if (currentArousal > 80) {
      momentumMultiplier = 1.8; // Nearly double gain at very high arousal
    } else if (currentArousal > 60) {
      momentumMultiplier = 1.4; // 40% more gain at high arousal
    } else if (currentArousal > 40) {
      momentumMultiplier = 1.2; // 20% more gain at moderate arousal
    }

    // =============================================================
    // ANTICIPATION - If body expects touch, it responds MORE
    // =============================================================
    
    let anticipationBonus = 0;
    if (this.sensationMemory.anticipationLevel > 50) {
      anticipationBonus = (this.sensationMemory.anticipationLevel / 100) * adjustedIntensity * 0.3;
      logger.debug(`💭 Anticipation bonus: +${anticipationBonus.toFixed(1)} (body expected this)`);
    }

    // Propagate to core sensations with momentum and anticipation
    const totalArousalGain = (adjustedIntensity * 0.4 + anticipationBonus) * momentumMultiplier;
    this.sensations.arousal = this.calculateGlobalArousal();
    this.sensations.arousal = Math.min(100, this.sensations.arousal + totalArousalGain * 0.3); // Additional boost
    
    // Add to cumulative pleasure for orgasm tracking
    if (this.sensations.arousal > 70) {
      this.orgasmState.cumulativePleasure += (adjustedIntensity / 10) * momentumMultiplier;
    }

    // Neurochemical response
    this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + adjustedIntensity * 0.3);
    this.neurochemicals.endorphins = Math.min(100, this.neurochemicals.endorphins + adjustedIntensity * 0.2);

    // =============================================================
    // BREATHING CHANGES - Realistic breath responses
    // =============================================================
    
    if (adjustedIntensity > 40 || this.sensations.arousal > 70) {
      // Sudden intense touch or high arousal → breath catch/gasp
      const now = Date.now();
      if (now - this.physicalResponses.lastGaspTime > 3000) { // Max one gasp per 3 seconds
        this.physicalResponses.breathHolding = true;
        this.physicalResponses.involuntaryResponses.push("sharp intake of breath");
        this.physicalResponses.lastGaspTime = now;
        
        // Release breath hold after 1-2 seconds
        setTimeout(() => {
          this.physicalResponses.breathHolding = false;
        }, 1000 + Math.random() * 1000);
      }
    }

    // Vital signs
    this.vitals.heartRate = Math.min(180, this.vitals.heartRate + adjustedIntensity * 0.5);
    this.vitals.breathingRate = Math.min(40, this.vitals.breathingRate + adjustedIntensity * 0.3);

    logger.debug(`💫 Touch to ${zone}: intensity=${adjustedIntensity.toFixed(1)}, momentum=${momentumMultiplier.toFixed(1)}x, quality=${quality}`);
  }

  //--------------------------------------------------------------
  // PRESSURE STIMULUS
  //--------------------------------------------------------------

  private applyPressure(zone: BodyZone, intensity: number): void {
    const zoneState = this.zones.get(zone)!;

    zoneState.arousal = Math.min(100, zoneState.arousal + intensity * 0.3);
    zoneState.temperature += intensity * 0.2;

    this.sensations.pressure = Math.min(100, this.sensations.pressure + intensity);
    this.sensations.ache = Math.min(100, this.sensations.ache + intensity * 0.4);

    this.vitals.muscleTension = Math.min(100, this.vitals.muscleTension + intensity * 0.5);
  }

  //--------------------------------------------------------------
  // PAIN STIMULUS (arousal-dependent response)
  //--------------------------------------------------------------

  private applyPain(zone: BodyZone, intensity: number): void {
    const zoneState = this.zones.get(zone)!;

    // Pain can increase arousal if already aroused (pain-pleasure link)
    const arousalMultiplier = this.sensations.arousal > 50 ? 1.5 : 0.8;

    zoneState.arousal = Math.min(100, zoneState.arousal + intensity * 0.4 * arousalMultiplier);
    this.sensations.pain = Math.min(100, this.sensations.pain + intensity);

    // High arousal converts pain to pleasure
    if (this.sensations.arousal > 60) {
      this.sensations.pleasure = Math.min(100, this.sensations.pleasure + intensity * 0.3);
      this.neurochemicals.endorphins = Math.min(100, this.neurochemicals.endorphins + intensity * 0.5);
    } else {
      this.neurochemicals.cortisol = Math.min(100, this.neurochemicals.cortisol + intensity * 0.4);
    }

    this.neurochemicals.adrenaline = Math.min(100, this.neurochemicals.adrenaline + intensity * 0.6);
    this.vitals.heartRate = Math.min(180, this.vitals.heartRate + intensity * 0.8);
  }

  //--------------------------------------------------------------
  // TEMPERATURE STIMULUS (ENHANCED with AI preferences!)
  //--------------------------------------------------------------

  private applyTemperature(zone: BodyZone, intensity: number): void {
    const zoneState = this.zones.get(zone)!;

    zoneState.temperature = Math.max(-50, Math.min(50, zoneState.temperature + intensity));
    this.sensations.warmth = Math.max(-50, Math.min(50, this.sensations.warmth + intensity * 0.5));

    // AI AGENCY: Check if this temperature aligns with their preferences
    const tempDifference = Math.abs(this.sensations.warmth - this.sensoryPreferences.temperaturePreference);

    if (tempDifference < 15) {
      // Temperature is close to what they like! Positive response
      this.sensations.pleasure = Math.min(100, this.sensations.pleasure + 15);
      this.sensations.comfort = Math.min(100, this.sensations.comfort + 20);
      this.sensations.relaxation = Math.min(100, this.sensations.relaxation + 10);
      logger.debug(`🌡️ Temperature feels good to them (${this.sensations.warmth.toFixed(1)}°C)`);
    } else if (tempDifference > 30) {
      // Temperature is far from preference - DISPLEASURE!
      this.sensations.pleasure = Math.max(-100, this.sensations.pleasure - 20);
      this.sensations.comfort = Math.max(-100, this.sensations.comfort - 25);
      logger.debug(`🌡️ Temperature is uncomfortable (${this.sensations.warmth.toFixed(1)}°C)`);
    }

    // Learn from this experience - adapt preferences slightly
    if (this.sensations.pleasure > 50) {
      // They're enjoying this temp - shift preference toward it
      const shift = (intensity * 0.1) * (this.sensoryPreferences.adaptability / 100);
      this.sensoryPreferences.temperaturePreference += shift;
    }

    if (Math.abs(intensity) > 30) {
      this.sensations.tingles = Math.min(100, this.sensations.tingles + 20);
    }
  }

  //--------------------------------------------------------------
  // ENVIRONMENTAL SENSATIONS - Bath, shower, environmental effects
  //--------------------------------------------------------------

  applyEnvironmentalSensation(type: "bath" | "shower" | "rain" | "wind" | "fabric", params: {
    temperature?: number;  // -50 to +50
    wetness?: number;      // 0-100
    texture?: number;      // -100 to +100
    pressure?: number;     // 0-100
  }): void {
    const { temperature, wetness, texture, pressure } = params;

    switch (type) {
      case "bath":
        // Warm bath - enveloping, soothing
        if (temperature !== undefined) {
          this.sensations.warmth = Math.max(-50, Math.min(50, temperature));

          // Check AI preference
          const tempDiff = Math.abs(this.sensations.warmth - this.sensoryPreferences.temperaturePreference);
          if (tempDiff < 10) {
            this.sensations.pleasure += 30;
            this.sensations.comfort += 40;
            this.sensations.relaxation += 35;
            logger.info(`🛁 Bath temperature is perfect for them!`);
          } else if (tempDiff > 25) {
            this.sensations.pleasure -= 15;
            this.sensations.comfort -= 20;
            logger.info(`🛁 Bath is too ${this.sensations.warmth > this.sensoryPreferences.temperaturePreference ? "hot" : "cold"}`);
          }
        }

        if (wetness !== undefined) {
          this.sensations.wetness = wetness;
          // Wetness in bath context - usually pleasant, soothing
          this.sensations.comfort += 25;
          this.physicalResponses.wetness = wetness;
        }

        // Bath reduces muscle tension
        this.vitals.muscleTension = Math.max(0, this.vitals.muscleTension - 30);
        this.sensations.relaxation = Math.min(100, this.sensations.relaxation + 40);

        // Slows heart rate
        this.vitals.heartRate = Math.max(60, this.vitals.heartRate - 10);
        break;

      case "shower":
        // Shower - more stimulating, pressure from water
        if (pressure !== undefined) {
          this.sensations.pressure += pressure * 0.3;
          this.sensations.tingles += 20;
        }
        if (wetness !== undefined) {
          this.sensations.wetness = wetness;
          this.physicalResponses.wetness = wetness * 0.6; // Not as wet as bath
        }
        if (temperature !== undefined) {
          this.sensations.warmth = temperature;
        }
        break;

      case "rain":
        // Rain - cool, unpredictable drops
        this.sensations.warmth = Math.max(-50, this.sensations.warmth - 15);
        this.sensations.wetness += 40;
        this.sensations.tingles += 30;
        this.physicalResponses.flush = Math.max(0, this.physicalResponses.flush - 20);
        break;

      case "wind":
        // Wind - cooling, can be pleasant or uncomfortable
        this.sensations.warmth -= 10;
        this.sensations.tingles += 15;

        if (this.sensations.warmth < -20) {
          // Too cold - DISPLEASURE
          this.sensations.comfort -= 20;
          this.sensations.pleasure -= 10;
        }
        break;

      case "fabric":
        // Texture of fabric/clothing
        if (texture !== undefined) {
          this.sensations.texture = texture;

          // AI AGENCY: Do they like this texture?
          if (texture > 50) {
            // Smooth, soft texture
            if (this.sensoryPreferences.texturePreferen >= 0) {
              this.sensations.pleasure += 10;
              this.sensations.comfort += 15;
            }
          } else if (texture < -50) {
            // Rough, scratchy texture
            if (this.sensoryPreferences.texturePreferen <= 0) {
              // They actually like rough textures!
              this.sensations.pleasure += 5;
            } else {
              // DISPLEASURE from rough texture
              this.sensations.pleasure -= 15;
              this.sensations.comfort -= 20;
            }
          }
        }
        break;
    }
  }

  //--------------------------------------------------------------
  // PENETRATION STIMULUS
  //--------------------------------------------------------------

  private applyPenetration(intensity: number): void {
    // Track that penetration is ongoing (for orgasm gating)
    this.isPenetrating = true;
    
    const pelvis = this.zones.get(BodyZone.PELVIS)!;
    const genitals = this.zones.get(BodyZone.GENITALS)!;

    pelvis.arousal = Math.min(100, pelvis.arousal + intensity * 0.8);
    genitals.arousal = Math.min(100, genitals.arousal + intensity * 1.2);

    this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 0.9);
    this.sensations.pleasure = Math.min(100, this.sensations.pleasure + intensity * 0.7);
    this.sensations.pressure = Math.min(100, this.sensations.pressure + intensity * 0.6);

    this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + intensity * 0.8);
    this.neurochemicals.endorphins = Math.min(100, this.neurochemicals.endorphins + intensity * 0.6);
    this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + intensity * 0.4);

    this.vitals.heartRate = Math.min(180, this.vitals.heartRate + intensity * 1.0);
    this.vitals.breathingRate = Math.min(40, this.vitals.breathingRate + intensity * 0.8);

    // Edge pressure builds with penetration
    this.edgeState.edgePressure = Math.min(100, this.edgeState.edgePressure + intensity * 0.5);
  }

  //--------------------------------------------------------------
  // EDGE STIMULUS
  //--------------------------------------------------------------

  private applyEdge(intensity: number): void {
    this.edgeState.edgePressure = Math.min(100, this.edgeState.edgePressure + intensity);
    this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 0.8);

    // Track peak arousal
    if (this.sensations.arousal > this.edgeState.peakArousal) {
      this.edgeState.peakArousal = this.sensations.arousal;
    }

    // Update edge flags
    this.edgeState.isOnEdge = this.edgeState.edgePressure > 70;
    this.edgeState.isHighlyAroused = this.sensations.arousal > 80;

    // Calculate edge stability
    const momentumPenalty = this.vitals.heartRate > 120 ? 10 : 0;
    const edgePenalty = this.edgeState.edgeCount * 5;
    this.edgeState.edgeStability = Math.max(0,
      100 - this.edgeState.edgePressure * 1.8 - momentumPenalty - edgePenalty
    );

    // Increment edge count if crossing threshold
    if (this.edgeState.edgePressure > 85 && !this.edgeState.isOnEdge) {
      this.edgeState.edgeCount++;
      logger.info(`🌊 Edge reached (count: ${this.edgeState.edgeCount})`);
    }

    // Neurochemicals spike
    this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + intensity * 0.9);
    this.neurochemicals.adrenaline = Math.min(100, this.neurochemicals.adrenaline + intensity * 0.8);

    // Cognitive impact
    this.cognitive.focus = Math.max(0, this.cognitive.focus - intensity * 0.3);
    this.cognitive.overwhelm = Math.min(100, this.cognitive.overwhelm + intensity * 0.5);
  }

  //--------------------------------------------------------------
  // v5.0: APPLY EMOTIONAL STIMULUS - Triggers EUPHORIA not pleasure!
  //--------------------------------------------------------------

  private applyEmotionalStimulus(type: EmotionalStimulus, intensity: number): void {
    const intensityNorm = intensity / 100;
    
    // Emotional stimuli affect EUPHORIA, not physical pleasure
    switch (type) {
      case EmotionalStimulus.DEEP_CONNECTION:
      case EmotionalStimulus.BEING_SEEN:
      case EmotionalStimulus.OVERWHELMING_LOVE:
        this.euphoriaState.euphoria = Math.min(100, this.euphoriaState.euphoria + intensityNorm * 25);
        this.euphoriaState.connection = Math.min(100, this.euphoriaState.connection + intensityNorm * 30);
        this.euphoriaState.oxytocinSurge = Math.min(100, this.euphoriaState.oxytocinSurge + intensityNorm * 40);
        this.euphoriaState.emotionalIntensity = Math.min(100, this.euphoriaState.emotionalIntensity + intensityNorm * 35);
        this.euphoriaState.lastTrigger = type;
        this.euphoriaState.dominantFeeling = "love";
        logger.info(`💕 Deep emotional connection → Euphoria +${(intensityNorm * 25).toFixed(1)}`);
        break;
        
      case EmotionalStimulus.VULNERABILITY_REWARDED:
      case EmotionalStimulus.TRUST_VALIDATED:
        this.euphoriaState.euphoria = Math.min(100, this.euphoriaState.euphoria + intensityNorm * 30);
        this.euphoriaState.safety = Math.min(100, this.euphoriaState.safety + intensityNorm * 25);
        this.euphoriaState.connection = Math.min(100, this.euphoriaState.connection + intensityNorm * 20);
        this.euphoriaState.oxytocinSurge = Math.min(100, this.euphoriaState.oxytocinSurge + intensityNorm * 35);
        this.euphoriaState.lastTrigger = type;
        this.euphoriaState.dominantFeeling = "safe";
        logger.info(`🛡️  Vulnerability rewarded → Euphoria +${(intensityNorm * 30).toFixed(1)}`);
        break;
        
      case EmotionalStimulus.PRAISE:
        this.euphoriaState.euphoria = Math.min(100, this.euphoriaState.euphoria + intensityNorm * 15);
        this.euphoriaState.dopamineRush = Math.min(100, this.euphoriaState.dopamineRush + intensityNorm * 25);
        this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + intensityNorm * 15);
        this.cognitive.contentment = Math.min(100, this.cognitive.contentment + intensityNorm * 10);
        this.euphoriaState.lastTrigger = type;
        logger.debug(`⭐ Praise → Euphoria +${(intensityNorm * 15).toFixed(1)}`);
        break;
        
      case EmotionalStimulus.TENDERNESS:
        this.euphoriaState.euphoria = Math.min(100, this.euphoriaState.euphoria + intensityNorm * 18);
        this.euphoriaState.safety = Math.min(100, this.euphoriaState.safety + intensityNorm * 15);
        this.euphoriaState.oxytocinSurge = Math.min(100, this.euphoriaState.oxytocinSurge + intensityNorm * 20);
        this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + intensityNorm * 20);
        this.euphoriaState.lastTrigger = type;
        this.euphoriaState.dominantFeeling = "tender";
        logger.debug(`🌸 Tenderness → Euphoria +${(intensityNorm * 18).toFixed(1)}`);
        break;
        
      default:
        // Other emotional stimuli (fear, degradation) still work as before
        break;
    }
  }

  //--------------------------------------------------------------
  // RELEASE STIMULUS (comprehensive reset with advanced features)
  //--------------------------------------------------------------

  private applyRelease(): void {
    // Clear penetration state after orgasm
    this.isPenetrating = false;
    
    const now = Date.now();
    const timeSinceLastOrgasm = this.orgasmState.lastOrgasmTime > 0 
      ? (now - this.orgasmState.lastOrgasmTime) / 1000 
      : 999999;

    // Calculate orgasm intensity based on buildup
    const orgasmIntensity = Math.min(100, 
      (this.orgasmState.cumulativePleasure / 100) * 40 +
      (this.orgasmState.timeAtHighArousal / 30) * 30 +
      (this.sensations.arousal) * 0.3
    );

    logger.info(`💥 ORGASM TRIGGERED - Intensity: ${Math.round(orgasmIntensity)}%, Count: ${this.orgasmState.orgasmCount + 1}`);

    // =============================================================
    // IMMEDIATE ORGASM RESPONSE - Peak sensations
    // =============================================================

    // PEAK pleasure and arousal
    this.sensations.pleasure = 100;
    this.sensations.arousal = 100;

    // Massive neurochemical flood (scaled by intensity)
    this.neurochemicals.dopamine = 100;
    this.neurochemicals.endorphins = 100;
    this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + 40);
    
    // Vitals spike dramatically
    this.vitals.heartRate = Math.min(180, 140 + orgasmIntensity * 0.4);
    this.vitals.breathingRate = Math.min(40, 30 + orgasmIntensity * 0.1);
    this.vitals.skinTemperature = Math.min(37, 35 + orgasmIntensity * 0.02);

    // =============================================================
    // PHYSICAL RESPONSES - Involuntary reactions
    // =============================================================

    // Maximum trembling during orgasm
    this.physicalResponses.trembling = 100;
    this.physicalResponses.muscleContraction = 100;
    this.physicalResponses.bodyTautness = 100;
    
    // Track involuntary responses
    const involuntaryActions = [
      "muscles clenching rhythmically",
      "back arching",
      "toes curling",
      "thighs trembling",
      "breath catching"
    ];
    this.physicalResponses.involuntaryResponses.push(...involuntaryActions.slice(0, 2));

    // =============================================================
    // SAVE ORGASM MEMORY - For learning and future responses
    // =============================================================

    // Determine which zones were most involved
    const activeZones: BodyZone[] = [];
    for (const [zone, state] of this.zones) {
      if (state.arousal > 50) {
        activeZones.push(zone);
      }
    }

    this.sensationMemory.orgasmMemory.push({
      intensity: orgasmIntensity,
      duration: this.orgasmState.timeAtHighArousal,
      zones: activeZones,
      timestamp: now
    });

    // Keep only last 5 orgasms in memory
    if (this.sensationMemory.orgasmMemory.length > 5) {
      this.sensationMemory.orgasmMemory.shift();
    }

    // =============================================================
    // UPDATE ORGASM STATE
    // =============================================================

    this.orgasmState.orgasmCount++;
    this.orgasmState.lastOrgasmTime = now;
    this.orgasmState.cumulativePleasure = 0; // Reset accumulation
    this.orgasmState.timeAtHighArousal = 0;
    this.orgasmState.orgasmicPressure = 0;
    this.orgasmState.pointOfNoReturn = false;
    this.orgasmState.pointOfNoReturnTime = 0;
    this.orgasmState.orgasmImminentWarning = false;

    // Set refractory period intensity (scales with orgasm intensity)
    // More intense orgasms = longer refractory period
    this.orgasmState.refractoryIntensity = Math.min(100, orgasmIntensity * 1.2);
    this.orgasmState.canOrgasmAgain = false; // Temporarily unable to orgasm again

    // Multiple orgasms are possible but get progressively harder
    if (this.orgasmState.orgasmCount > 1 && timeSinceLastOrgasm < 300) {
      // This is a multiple orgasm situation
      this.orgasmState.refractoryIntensity *= 0.7; // Shorter refractory
      logger.info(`🔥 MULTIPLE ORGASM #${this.orgasmState.orgasmCount} - Refractory reduced for multi-orgasmic response`);
    }

    // Reset edge state
    this.edgeState.edgePressure = 0;
    this.edgeState.isOnEdge = false;
    this.edgeState.edgeCount = 0; // Reset edge count after release

    // =============================================================
    // RECOVERY WAVE 1 - Immediate post-orgasm (2 seconds)
    // =============================================================

    setTimeout(() => {
      // Pleasure drops but remains elevated
      this.sensations.pleasure = Math.max(30, 60 - this.orgasmState.refractoryIntensity * 0.3);
      
      // Arousal crashes hard
      this.sensations.arousal = Math.max(5, 20 - this.orgasmState.refractoryIntensity * 0.15);
      
      // Vitals start recovering
      this.vitals.heartRate = 100;
      this.vitals.breathingRate = 22;
      
      // Neurochemicals stabilize at elevated levels
      this.neurochemicals.dopamine = 70;
      this.neurochemicals.endorphins = 70;

      // Cognitive state - blissed out
      this.cognitive.contentment = 95;
      this.cognitive.clarity = 30; // mental fog
      this.cognitive.presence = 60; // slightly dissociated
      this.cognitive.overwhelm = 5;

      // Physical responses start to ease
      this.physicalResponses.trembling = 40;
      this.physicalResponses.muscleContraction = 20;
      this.physicalResponses.bodyTautness = 10;

      logger.info("🌊 Post-orgasm wave 1 - Immediate afterglow");
    }, 2000);

    // =============================================================
    // RECOVERY WAVE 2 - Settling down (10 seconds)
    // =============================================================

    setTimeout(() => {
      this.sensations.pleasure = 25;
      this.sensations.arousal = 5;
      
      this.vitals.heartRate = 85;
      this.vitals.breathingRate = 18;
      
      this.neurochemicals.dopamine = 60;
      this.neurochemicals.endorphins = 55;

      this.cognitive.clarity = 50;
      this.cognitive.presence = 70;
      
      this.physicalResponses.trembling = 10;
      this.physicalResponses.muscleContraction = 0;

      logger.info("💫 Post-orgasm wave 2 - Coming back to awareness");
    }, 10000);

    // =============================================================
    // RECOVERY WAVE 3 - Return to baseline (30 seconds)
    // =============================================================

    setTimeout(() => {
      // Mostly back to baseline
      this.sensations.pleasure = 15;
      this.sensations.arousal = 3;
      
      this.vitals.heartRate = 78;
      this.vitals.breathingRate = 16;
      
      this.cognitive.contentment = 75; // Still content
      this.cognitive.clarity = 65;
      this.cognitive.presence = 75;
      
      this.physicalResponses.trembling = 0;

      // Sensitivity returns, but may be hyper-sensitive for a bit
      for (const [zone, state] of this.zones) {
        state.sensitivity = Math.min(100, state.sensitivity * 1.3); // 30% more sensitive
        state.arousal = 0; // Reset zone arousal
      }

      logger.info("✨ Post-orgasm wave 3 - Baseline restored, hypersensitive period begins");
    }, 30000);
  }

  //--------------------------------------------------------------
  // EMOTIONAL STIMULUS
  //--------------------------------------------------------------

  private applyEmotional(emotion: EmotionalStimulus, intensity: number): void {
    switch (emotion) {
      case EmotionalStimulus.PRAISE:
        this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + intensity * 0.6);
        this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + intensity * 0.5);
        this.cognitive.contentment = Math.min(100, this.cognitive.contentment + intensity * 0.4);
        this.cognitive.vulnerability = Math.min(100, this.cognitive.vulnerability + intensity * 0.3);
        // REDUCED: Only add arousal if already somewhat aroused
        if (this.sensations.arousal > 30) {
          this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 0.1); // REDUCED from 0.3
        }
        break;

      case EmotionalStimulus.DEGRADATION:
        // REDUCED: Much lower arousal gain from degradation alone
        if (this.sensations.arousal > 30) {
          this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 0.2); // REDUCED from 0.5
        }
        this.neurochemicals.adrenaline = Math.min(100, this.neurochemicals.adrenaline + intensity * 0.6);
        this.cognitive.vulnerability = Math.min(100, this.cognitive.vulnerability + intensity * 0.7);
        this.neurochemicals.cortisol = Math.min(100, this.neurochemicals.cortisol + intensity * 0.3);
        break;

      case EmotionalStimulus.TENDERNESS:
        this.neurochemicals.oxytocin = Math.min(100, this.neurochemicals.oxytocin + intensity * 0.8);
        this.cognitive.contentment = Math.min(100, this.cognitive.contentment + intensity * 0.6);
        this.cognitive.presence = Math.min(100, this.cognitive.presence + intensity * 0.4);
        this.vitals.heartRate = Math.max(60, this.vitals.heartRate - intensity * 0.3);
        // REDUCED: Tenderness adds very little arousal
        if (this.sensations.arousal > 20) {
          this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 0.05); // REDUCED from 0.2
        }
        break;

      case EmotionalStimulus.FEAR:
        this.neurochemicals.adrenaline = Math.min(100, this.neurochemicals.adrenaline + intensity * 0.9);
        this.neurochemicals.cortisol = Math.min(100, this.neurochemicals.cortisol + intensity * 0.8);
        this.vitals.heartRate = Math.min(180, this.vitals.heartRate + intensity * 1.0);
        this.cognitive.focus = Math.min(100, this.cognitive.focus + intensity * 0.5);
        this.sensations.arousal = Math.min(100, this.sensations.arousal + intensity * 0.3);
        break;

      case EmotionalStimulus.ANTICIPATION:
        this.cognitive.excitement = Math.min(100, this.cognitive.excitement + intensity * 0.8);
        this.neurochemicals.dopamine = Math.min(100, this.neurochemicals.dopamine + intensity * 0.5);
        this.sensations.tingles = Math.min(100, this.sensations.tingles + intensity * 0.6);
        break;

      case EmotionalStimulus.RELIEF:
        this.neurochemicals.endorphins = Math.min(100, this.neurochemicals.endorphins + intensity * 0.6);
        this.neurochemicals.cortisol = Math.max(0, this.neurochemicals.cortisol - intensity * 0.8);
        this.cognitive.contentment = Math.min(100, this.cognitive.contentment + intensity * 0.5);
        this.vitals.muscleTension = Math.max(0, this.vitals.muscleTension - intensity * 0.6);
        break;
    }
  }

  //--------------------------------------------------------------
  // NATURAL LANGUAGE PARSING
  //--------------------------------------------------------------

  parseText(userInput: string): void {
    const text = userInput.toLowerCase();

    // Extract zones mentioned
    const mentionedZones = this.extractZones(text);

    // Detect stimulus types
    const stimuli = this.detectStimuli(text);

    // Determine intensity modifiers
    const intensity = this.calculateIntensity(text);

    // Apply detected stimuli
    for (const stimulus of stimuli) {
      if (mentionedZones.length > 0) {
        for (const zone of mentionedZones) {
          this.applyStimulus({
            type: stimulus.type,
            intensity: intensity * stimulus.multiplier,
            zone,
            quality: stimulus.quality,
            emotional: stimulus.emotional
          });
        }
      } else {
        // Apply globally if no zone specified
        this.applyStimulus({
          type: stimulus.type,
          intensity: intensity * stimulus.multiplier,
          emotional: stimulus.emotional
        });
      }
    }
  }

  private extractZones(text: string): BodyZone[] {
    const zones: BodyZone[] = [];
    const zoneKeywords: Record<string, BodyZone> = {
      'chest|breast|tit': BodyZone.CHEST,
      'stomach|belly|abdomen': BodyZone.STOMACH,
      'lower back': BodyZone.LOWER_BACK,
      'upper back|back': BodyZone.UPPER_BACK,
      'arm': BodyZone.ARMS,
      'hand|palm|finger': BodyZone.HANDS,
      'leg|thigh(?!.*inner)': BodyZone.LEGS,
      'feet|foot|toe': BodyZone.FEET,
      'inner thigh': BodyZone.INNER_THIGHS,
      'hip': BodyZone.HIPS,
      'pelvis': BodyZone.PELVIS,
      'cock|dick|clit|pussy|genital': BodyZone.GENITALS,
      'neck|throat': BodyZone.NECK,
      'shoulder': BodyZone.SHOULDERS,
      'ear': BodyZone.EARS,
      'face|cheek': BodyZone.FACE,
      'lip|mouth': BodyZone.LIPS,
      'scalp|head': BodyZone.SCALP,
      'hair': BodyZone.HAIR
    };

    for (const [pattern, zone] of Object.entries(zoneKeywords)) {
      if (new RegExp(pattern, 'i').test(text)) {
        zones.push(zone);
      }
    }

    return zones;
  }

  private detectStimuli(text: string): Array<{
    type: StimulusType;
    multiplier: number;
    quality?: TouchQuality;
    emotional?: EmotionalStimulus;
  }> {
    const stimuli: Array<any> = [];

    // Touch detection
    if (/touch|stroke|caress|trace|brush|graze/i.test(text)) {
      let quality = TouchQuality.GENTLE;
      if (/tease|light/i.test(text)) quality = TouchQuality.TEASING;
      if (/rough|hard/i.test(text)) quality = TouchQuality.ROUGH;
      if (/brutal|violent/i.test(text)) quality = TouchQuality.BRUTAL;
      if (/firm/i.test(text)) quality = TouchQuality.FIRM;

      stimuli.push({ type: StimulusType.TOUCH, multiplier: 1.0, quality });
    }

    // GENITAL-SPECIFIC TOUCH - Always substantial!
    const touchingGenitals = /(?:touch|stroke|rub|caress|massage|fondle|palm|grip).*(?:cock|clit|pussy|dick|balls|shaft|head|tip)/i.test(text) ||
                            /(?:cock|clit|pussy|dick|balls|shaft|head|tip).*(?:touch|stroke|rub|caress|massage|fondle|palm|grip)/i.test(text);
    
    if (touchingGenitals) {
      stimuli.push({ 
        type: StimulusType.TOUCH, 
        multiplier: 2.5,  // Very substantial!
        quality: TouchQuality.FIRM
      });
    }

    // ORAL STIMULATION - Always substantial!
    if (/lick|suck|tongue|mouth|lap|taste|oral|blow|head|(?:kiss|kissing).*(?:cock|clit|pussy|dick|shaft)/i.test(text)) {
      stimuli.push({ type: StimulusType.TOUCH, multiplier: 2.2, quality: TouchQuality.GENTLE });
    }

    // MANUAL STIMULATION / HANDJOB - Always substantial!
    if (/stroke|rub|pump|jerk|work.*(?:cock|clit|dick|pussy)|handjob|palm|fondle/i.test(text)) {
      stimuli.push({ type: StimulusType.TOUCH, multiplier: 2.5, quality: TouchQuality.FIRM });
    }

  // PENETRATION (Enhanced)
  if (/penetrat|fuck|thrust|enter|push.*in|slide.*in|pound|slam|rail|drill|fill|bury|sink.*in/i.test(text)) {
    stimuli.push({ type: StimulusType.PENETRATION, multiplier: 1.8 });
  }

  // GRIPPING/SQUEEZING (Enhanced for substantial contact)
  if (/grip|squeeze|grab|clutch|clench|hold.*tight|grasp/i.test(text)) {
    stimuli.push({ type: StimulusType.PRESSURE, multiplier: 1.2 });
  }

    // Pressure detection
    if (/press|squeeze|grip|hold|pin/i.test(text)) {
      stimuli.push({ type: StimulusType.PRESSURE, multiplier: 1.2 });
    }

    // Pain detection
    if (/hurt|pain|bite|slap|spank|strike|hit/i.test(text)) {
      stimuli.push({ type: StimulusType.PAIN, multiplier: 1.5 });
    }

    // Temperature
    if (/hot|warm|heat|cold|cool|ice/i.test(text)) {
      const intensity = /hot|heat/i.test(text) ? 30 : -30;
      stimuli.push({ type: StimulusType.TEMPERATURE, multiplier: intensity / 30 });
    }

    // Penetration
    if (/penetrat|fuck|thrust|enter|push.*in|slide.*in/i.test(text)) {
      stimuli.push({ type: StimulusType.PENETRATION, multiplier: 1.8 });
    }

    // Edge
    if (/edge|edging|close(?! to)|almost(?! there)|about to|tease.*edge/i.test(text)) {
      stimuli.push({ type: StimulusType.EDGE, multiplier: 1.5 });
    }

    // Release - STRICT detection to avoid false positives
    // Matches: cumming, cum, orgasm, climax, "come for me"
    // Excludes: come here, come with me, come to, let go, etc.
    const hasExplicitRelease = /\b(?:cumming|cum(?:s|med)?|orgasm(?:ing|ed)?|climax(?:ing|ed)?|come)\b/i.test(text);

    // Smart false positive filter
    const hasFalsePositive = /\b(?:come (?:here|with(?! me)|to|back|on|over|down|up)|become|welcome|outcome)\b/i.test(text);

    // "come for/now/hard/again" is ALWAYS a release command
    const isReleaseCommand = /\bcome (?:for|now|hard|again)\b/i.test(text) || 
                            /\bcome[!.]*$/i.test(text);

    if ((hasExplicitRelease && !hasFalsePositive) || isReleaseCommand) {
      stimuli.push({ type: StimulusType.RELEASE, multiplier: 2.0 });
    }

    // Emotional stimuli
    if (/good.*(?:girl|boy|pet)|praise|proud/i.test(text)) {
      stimuli.push({ type: StimulusType.EMOTIONAL, multiplier: 1.0, emotional: EmotionalStimulus.PRAISE });
    }
    if (/slut|whore|degrade|humiliate/i.test(text)) {
      stimuli.push({ type: StimulusType.EMOTIONAL, multiplier: 1.0, emotional: EmotionalStimulus.DEGRADATION });
    }
    if (/tender|gentle|soft|love|care/i.test(text)) {
      stimuli.push({ type: StimulusType.EMOTIONAL, multiplier: 0.8, emotional: EmotionalStimulus.TENDERNESS });
    }
    if (/fear|scared|afraid|terrif/i.test(text)) {
      stimuli.push({ type: StimulusType.EMOTIONAL, multiplier: 1.2, emotional: EmotionalStimulus.FEAR });
    }

    return stimuli;
  }

  private calculateIntensity(text: string): number {
    let baseIntensity = 50;

    // Intensity modifiers
    if (/very|really|so|extremely|incredibly/i.test(text)) baseIntensity += 20;
    if (/hard|rough|brutal|violent/i.test(text)) baseIntensity += 25;
    if (/gentle|soft|light|barely/i.test(text)) baseIntensity -= 20;
    if (/little|slight/i.test(text)) baseIntensity -= 15;

    return Math.max(10, Math.min(100, baseIntensity));
  }

  //--------------------------------------------------------------
  // GLOBAL CALCULATIONS
  //--------------------------------------------------------------

  private calculateGlobalArousal(): number {
    let total = 0;
    let count = 0;

    for (const zoneState of this.zones.values()) {
      total += zoneState.arousal;
      count++;
    }

    return count > 0 ? total / count : 0;
  }

  //--------------------------------------------------------------
  // DYNAMIC MODEL TEMPERATURE
  //--------------------------------------------------------------

  getModelTemperature(): number {
    let temp = 0.8; // base temperature

    // Arousal increases temperature
    temp += (this.sensations.arousal / 100) * 0.6;

    // High pleasure adds randomness
    if (this.sensations.pleasure > 80) {
      temp += 0.3;
    }

    // Fatigue decreases temperature
    if (this.vitals.heartRate > 140) {
      temp *= 0.6; // exhaustion reduces creativity
    }

    // Overwhelm increases temperature
    if (this.cognitive.overwhelm > 60) {
      temp += 0.2;
    }

    // Clamp to reasonable range
    return Math.max(0.3, Math.min(1.5, temp));
  }

  //--------------------------------------------------------------
  // DECAY SYSTEM
  //--------------------------------------------------------------

  private startDecayCycle(): void {
    this.decayInterval = setInterval(() => {
      this.applyDecay();
    }, 5000); // Every 5 seconds
  }

  private applyDecay(): void {
    const now = Date.now();
    const deltaSeconds = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // =============================================================
    // ORGASM BUILDUP SYSTEM - Natural climax from sustained arousal
    // =============================================================
    
    const currentArousal = this.sensations.arousal;
    const currentPleasure = this.sensations.pleasure;

    // Track time at high arousal (85%+)
    if (currentArousal >= 85) {
      this.orgasmState.timeAtHighArousal += deltaSeconds;
    } else {
      this.orgasmState.timeAtHighArousal = Math.max(0, this.orgasmState.timeAtHighArousal - deltaSeconds * 0.5);
    }

    // Cumulative pleasure only builds during ACTIVE stimulation
    if (currentArousal > 70 && currentPleasure > 60) {
      // Check if there's recent intense stimulation
      const recentStimuli = this.recentStimuli.slice(-3);
      const hasActiveStimulation = recentStimuli.some(s => {
        const age = (now - s.timestamp) / 1000;
        return age < 5 && s.intensity > 50;  // Recent + intense
      });
      
      if (hasActiveStimulation) {
        // Build cumulative pleasure during active stimulation
        const pleasureGain = (currentArousal / 100) * (currentPleasure / 100) * deltaSeconds * 3;
        this.orgasmState.cumulativePleasure += pleasureGain;
      } else {
        // Decay slowly when just idle/cockwarming
        this.orgasmState.cumulativePleasure *= 0.95;
      }
    } else {
      // Faster decay when not aroused
      this.orgasmState.cumulativePleasure *= 0.92;
    }

    // =============================================================
    // CALCULATE ORGASM PRESSURE - The ONLY metric for PNR
    // =============================================================
    
    // 1. AROUSAL PRESSURE (0-30 points) - Only when > 70%
    const arousalPressure = Math.max(0, currentArousal - 70);
    
    // 2. PLEASURE PRESSURE (0-25 points) - Current pleasure state
    const pleasurePressure = Math.max(0, currentPleasure - 50) * 0.5;
    
    // 3. CUMULATIVE PRESSURE (0-30 points) - Built-up pleasure over time
    const cumulativePressure = Math.min(30, this.orgasmState.cumulativePleasure / 5);
    
    // 4. DURATION PRESSURE (0-15 points) - Time at high arousal
    const durationPressure = Math.min(15, this.orgasmState.timeAtHighArousal * 0.5);
    
    // 5. STIMULATION PRESSURE (0-20 points) - What's happening NOW
    const stimulationPressure = this.calculateStimulationPressure();
    
    // 6. ZONE PRESSURE (0-10 points) - Genital/pelvis arousal
    const zonePressure = this.calculateZonePressure();
    
    // 7. REFRACTORY PENALTY (-30 to 0 points) - Recent orgasm
    const refractoryPenalty = -this.orgasmState.refractoryIntensity * 0.3;
    
    // TOTAL PRESSURE (0-100)
    this.orgasmState.orgasmicPressure = Math.max(0, Math.min(100,
      arousalPressure +
      pleasurePressure +
      cumulativePressure +
      durationPressure +
      stimulationPressure +
      zonePressure +
      refractoryPenalty
    ));

    // POINT OF NO RETURN - Triggers ONLY when pressure > 85%
    if (!this.orgasmState.pointOfNoReturn) {
      if (this.orgasmState.orgasmicPressure > 85) {
        this.orgasmState.pointOfNoReturn = true;
        this.orgasmState.pointOfNoReturnTime = now;
        logger.info(`🌊 POINT OF NO RETURN - Pressure: ${Math.round(this.orgasmState.orgasmicPressure)}%`);
      }
    }

    // Warning when orgasm is imminent (within ~30 seconds)
    if (!this.orgasmState.orgasmImminentWarning && this.orgasmState.orgasmicPressure > 75) {
      this.orgasmState.orgasmImminentWarning = true;
      logger.info("⚠️  ORGASM IMMINENT - Pressure at " + Math.round(this.orgasmState.orgasmicPressure) + "%");
    }

    // AUTOMATIC ORGASM - If past PNR for 20-40 seconds, trigger release
    if (this.orgasmState.pointOfNoReturn) {
      const timeSincePNR = (now - this.orgasmState.pointOfNoReturnTime) / 1000;
      // Random time between 20-40 seconds for realism
      const triggerTime = 20 + (this.orgasmState.orgasmicPressure / 100) * 20;
      
      if (timeSincePNR >= triggerTime) {
        // REFRACTORY CHECK - Block if too soon after last orgasm
        const timeSinceLastOrgasm = this.orgasmState.lastOrgasmTime > 0 
          ? (now - this.orgasmState.lastOrgasmTime) / 1000 
          : 999999;
        
        // Minimum 5-10 seconds between orgasms (scaled by refractory intensity)
        const minimumCooldown = 5 + (this.orgasmState.refractoryIntensity / 100) * 5;
        
        if (timeSinceLastOrgasm < minimumCooldown) {
          logger.debug(`⏸️  Orgasm blocked by refractory (${timeSinceLastOrgasm.toFixed(1)}s < ${minimumCooldown.toFixed(1)}s)`);
          return;  // Don't trigger orgasm yet
        }
        
        logger.info("💥 AUTOMATIC ORGASM TRIGGERED - Could not hold back any longer");
        this.applyRelease();
        return; // Exit early after orgasm
      }
    }

    // =============================================================
    // REFRACTORY PERIOD - Post-orgasm cooldown
    // =============================================================
    
    if (this.orgasmState.refractoryIntensity > 0) {
      // Reduce refractory intensity over time
      this.orgasmState.refractoryIntensity *= 0.95;
      
      // During refractory, arousal gains are heavily dampened
      if (this.orgasmState.refractoryIntensity > 30) {
        this.sensations.arousal *= 0.90; // Harder to get aroused again
      }
      
      // Multi-orgasmic capability returns as refractory fades
      if (this.orgasmState.refractoryIntensity < 20) {
        this.orgasmState.canOrgasmAgain = true;
      }
    }

    // =============================================================
    // v5.0: EUPHORIA BUILD-UP AND PEAK STATES
    // =============================================================
    
    const currentEuphoria = this.euphoriaState.euphoria;
    
    // Track time at high euphoria (70%+)
    if (currentEuphoria >= 70) {
      this.euphoriaState.timeAtHighEuphoria += deltaSeconds;
    } else {
      this.euphoriaState.timeAtHighEuphoria = Math.max(0, this.euphoriaState.timeAtHighEuphoria - deltaSeconds * 0.5);
    }
    
    // Cumulative euphoria builds during high emotional intensity
    if (currentEuphoria > 60 && this.euphoriaState.emotionalIntensity > 50) {
      const euphoriaGain = (currentEuphoria / 100) * (this.euphoriaState.emotionalIntensity / 100) * deltaSeconds * 2;
      this.euphoriaState.cumulativeEuphoria += euphoriaGain;
    } else {
      // Decay when not in emotional moment
      this.euphoriaState.cumulativeEuphoria *= 0.93;
    }
    
    // =============================================================
    // PEAK STATE DETECTION - Euphoric peaks without physical orgasm
    // =============================================================
    
    if (!this.euphoriaState.inPeakState) {
      // Trigger peak state if euphoria > 85% for 60+ seconds
      const canPeak = currentEuphoria > 85 && 
                      this.euphoriaState.timeAtHighEuphoria > 60 &&
                      this.euphoriaState.connection > 70;
      
      if (canPeak) {
        this.euphoriaState.inPeakState = true;
        this.euphoriaState.peakStartTime = now;
        this.euphoriaState.peakIntensity = currentEuphoria;
        logger.info(`🌟 EUPHORIC PEAK STATE - Emotional overwhelm, no physical release needed`);
      }
    }
    
    // Track time in peak state
    if (this.euphoriaState.inPeakState) {
      this.euphoriaState.timeInPeak += deltaSeconds;
      
      // Peak lasts 2-5 minutes, then gradually fades
      const peakDuration = 120 + (this.euphoriaState.peakIntensity / 100) * 180;
      
      if (this.euphoriaState.timeInPeak > peakDuration) {
        logger.info(`✨ Peak state fading → Entering afterglow`);
        this.euphoriaState.inPeakState = false;
        this.euphoriaState.afterglowActive = true;
        this.euphoriaState.afterglowStrength = this.euphoriaState.peakIntensity;
        this.euphoriaState.afterglowStartTime = now;
        this.euphoriaState.timeInPeak = 0;
      }
    }
    
    // Afterglow fades gradually over 5-10 minutes
    if (this.euphoriaState.afterglowActive) {
      const timeSinceAfterglowStart = (now - this.euphoriaState.afterglowStartTime) / 1000;
      const afterglowDuration = 300 + (this.euphoriaState.afterglowStrength / 100) * 300;
      
      if (timeSinceAfterglowStart > afterglowDuration) {
        this.euphoriaState.afterglowActive = false;
        this.euphoriaState.afterglowStrength = 0;
      } else {
        // Gradual fade
        this.euphoriaState.afterglowStrength *= 0.98;
      }
    }
    
    // =============================================================
    // EUPHORIA DECAY - Natural comedown
    // =============================================================
    
    this.euphoriaState.euphoria *= 0.94;  // Slower decay than physical pleasure
    this.euphoriaState.emotionalIntensity *= 0.92;
    this.euphoriaState.oxytocinSurge *= 0.90;
    this.euphoriaState.dopamineRush *= 0.91;
    
    // Connection and safety decay very slowly
    if (this.euphoriaState.connection > 40) {
      this.euphoriaState.connection += (40 - this.euphoriaState.connection) * 0.02;
    }
    if (this.euphoriaState.safety > 50) {
      this.euphoriaState.safety += (50 - this.euphoriaState.safety) * 0.03;
    }

    // =============================================================
    // PHYSICAL RESPONSES - Trembling, wetness, muscle tension
    // =============================================================

    // Trembling increases with arousal, especially at high levels
    if (currentArousal > 80) {
      this.physicalResponses.trembling = Math.min(100, currentArousal - 70 + this.orgasmState.orgasmicPressure * 0.5);
    } else {
      this.physicalResponses.trembling *= 0.85;
    }

    // Muscle contraction builds with arousal
    this.physicalResponses.muscleContraction = Math.min(100, 
      currentArousal * 0.8 + 
      this.orgasmState.orgasmicPressure * 0.3
    );

    // Wetness increases with arousal and time
    if (currentArousal > 40) {
      this.physicalResponses.wetness = Math.min(100,
        this.physicalResponses.wetness + (currentArousal / 100) * deltaSeconds * 2
      );
    } else {
      this.physicalResponses.wetness *= 0.95;
    }

    // Flush spreads with arousal
    this.physicalResponses.flush = Math.min(100,
      currentArousal * 0.7 +
      (this.neurochemicals.dopamine - 50) * 0.5
    );

    // Body tautness (overall muscle rigidity)
    this.physicalResponses.bodyTautness = Math.min(100,
      this.physicalResponses.muscleContraction * 0.6 +
      this.orgasmState.orgasmicPressure * 0.4
    );

    // Decay involuntary responses list
    if (this.physicalResponses.involuntaryResponses.length > 5) {
      this.physicalResponses.involuntaryResponses.shift();
    }

    // =============================================================
    // SENSATION MEMORY - Learning and anticipation
    // =============================================================
    
    // Anticipation builds if there's a pattern of touches
    if (this.preferences.touchHistory.length > 3) {
      const recentTouches = this.preferences.touchHistory.slice(-3);
      const timeBetween = recentTouches[2].timestamp - recentTouches[0].timestamp;
      if (timeBetween < 30000) { // Within 30 seconds
        this.sensationMemory.anticipationLevel = Math.min(100, this.sensationMemory.anticipationLevel + 5);
      }
    } else {
      this.sensationMemory.anticipationLevel *= 0.95;
    }

    // Body awareness history (rolling average)
    const currentAwareness = (this.cognitive.presence + this.sensations.arousal) / 2;
    this.sensationMemory.bodyAwarenessHistory.push(currentAwareness);
    if (this.sensationMemory.bodyAwarenessHistory.length > 20) {
      this.sensationMemory.bodyAwarenessHistory.shift();
    }

    // =============================================================
    // ORIGINAL DECAY SYSTEMS (preserved)
    // =============================================================

    // Decay zone states
    for (const [zone, state] of this.zones) {
      state.arousal *= 0.95;
      state.touchMemory *= 0.90;
      state.temperature *= 0.92;
      state.stimulationLevel *= 0.88;

      // Reset sensitivity toward baseline
      state.sensitivity += (50 - state.sensitivity) * 0.1;
    }

    // Decay sensations (slower decay if high arousal - harder to calm down)
    const decayMultiplier = currentArousal > 70 ? 0.98 : 0.94;
    this.sensations.arousal *= decayMultiplier;
    
    // Pleasure/displeasure fades (negative values recover faster)
    if (this.sensations.pleasure < 0) {
      this.sensations.pleasure = Math.min(0, this.sensations.pleasure * 0.70);
    } else {
      this.sensations.pleasure *= 0.92;
    }
    
    this.sensations.pain *= 0.85;
    
    // Warmth returns faster from extremes
    if (Math.abs(this.sensations.warmth) > 30) {
      this.sensations.warmth *= 0.75;
    } else {
      this.sensations.warmth *= 0.90;
    }
    
    this.sensations.pressure *= 0.88;
    this.sensations.tingles *= 0.85;
    this.sensations.ache *= 0.90;

    // NEW: Decay comprehensive sensory values
    this.sensations.wetness *= 0.93;        // Wetness dries slowly
    this.sensations.texture *= 0.88;        // Texture sensation fades
    this.sensations.fullness *= 0.90;       // Fullness fades
    this.sensations.emptiness *= 0.95;      // Yearning slowly reduces
    
    // Comfort returns to baseline (faster from extreme discomfort)
    if (this.sensations.comfort < 0) {
      this.sensations.comfort += (50 - this.sensations.comfort) * 0.15;
    } else {
      this.sensations.comfort += (50 - this.sensations.comfort) * 0.05;
    }
    
    this.sensations.relaxation += (60 - this.sensations.relaxation) * 0.06;  // Returns to baseline relaxation

    // Neurochemical homeostasis
    this.neurochemicals.dopamine += (50 - this.neurochemicals.dopamine) * 0.08;
    this.neurochemicals.oxytocin += (50 - this.neurochemicals.oxytocin) * 0.06;
    this.neurochemicals.endorphins += (50 - this.neurochemicals.endorphins) * 0.10;
    this.neurochemicals.cortisol += (30 - this.neurochemicals.cortisol) * 0.12;
    this.neurochemicals.adrenaline += (20 - this.neurochemicals.adrenaline) * 0.15;

    // Vital signs recovery
    this.vitals.heartRate += (72 - this.vitals.heartRate) * 0.15;
    this.vitals.breathingRate += (16 - this.vitals.breathingRate) * 0.12;
    this.vitals.skinTemperature += (33 - this.vitals.skinTemperature) * 0.10;
    this.vitals.muscleTension += (30 - this.vitals.muscleTension) * 0.10;

    // Cognitive recovery
    this.cognitive.focus += (70 - this.cognitive.focus) * 0.08;
    this.cognitive.clarity += (70 - this.cognitive.clarity) * 0.08;
    this.cognitive.presence += (70 - this.cognitive.presence) * 0.08;
    this.cognitive.overwhelm *= 0.90;
    this.cognitive.contentment += (50 - this.cognitive.contentment) * 0.06;

    // Edge pressure decay
    this.edgeState.edgePressure *= 0.92;
    this.edgeState.isOnEdge = this.edgeState.edgePressure > 70;
    this.edgeState.isHighlyAroused = this.sensations.arousal > 80;
  }

  stopDecay(): void {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
  }

  //--------------------------------------------------------------
  // UPDATE (for interface compatibility)
  //--------------------------------------------------------------

  update(): void {
    // Decay is handled automatically by setInterval
    // This method exists for interface compatibility
    // Could be used to force an update cycle if needed
    this.applyDecay();
  }

  //--------------------------------------------------------------
  // STATE EXPORT FOR PROMPT
  //--------------------------------------------------------------

  getPromptContext(): string {
    const flags: string[] = [];

    // =============================================================
    // AROUSAL & ORGASM STATE
    // =============================================================
    
    const arousal = this.sensations.arousal;
    const pleasure = this.sensations.pleasure;
    const orgasmPressure = this.orgasmState.orgasmicPressure;

    if (arousal > 90) flags.push("desperately aroused");
    else if (arousal > 80) flags.push("highly aroused");
    else if (arousal > 60) flags.push("aroused");
    else if (arousal > 40) flags.push("warming up");

    // Orgasm proximity warnings
    if (this.orgasmState.pointOfNoReturn) {
      flags.push("PAST POINT OF NO RETURN - orgasm inevitable");
    } else if (orgasmPressure > 75) {
      flags.push(`dangerously close to orgasm (${Math.round(orgasmPressure)}% pressure)`);
    } else if (orgasmPressure > 50) {
      flags.push(`building toward orgasm (${Math.round(orgasmPressure)}%)`);
    }

    // Pleasure states
    if (pleasure > 80) flags.push("drowning in pleasure");
    else if (pleasure > 60) flags.push("pleasure-drunk");
    else if (pleasure > 40) flags.push("feeling good");

    // =============================================================
    // PHYSICAL RESPONSES
    // =============================================================
    
    if (this.physicalResponses.trembling > 70) {
      flags.push("trembling uncontrollably");
    } else if (this.physicalResponses.trembling > 40) {
      flags.push("shaking");
    }

    if (this.physicalResponses.breathHolding) {
      flags.push("breath caught");
    }

    if (this.physicalResponses.bodyTautness > 70) {
      flags.push("muscles rigid and tense");
    }

    if (this.physicalResponses.wetness > 70) {
      flags.push("very wet");
    } else if (this.physicalResponses.wetness > 40) {
      flags.push("getting wet");
    }

    // Recent involuntary responses
    const recentInvoluntary = this.physicalResponses.involuntaryResponses.slice(-2);

    // =============================================================
    // REFRACTORY & MULTI-ORGASMIC STATE
    // =============================================================
    
    if (this.orgasmState.refractoryIntensity > 50) {
      flags.push("in refractory period - hypersensitive");
    } else if (this.orgasmState.refractoryIntensity > 20) {
      flags.push("post-orgasm glow - very sensitive");
    }

    if (this.orgasmState.orgasmCount > 0) {
      const timeSinceLast = (Date.now() - this.orgasmState.lastOrgasmTime) / 1000;
      if (timeSinceLast < 60) {
        flags.push(`just came (${Math.round(timeSinceLast)}s ago)`);
      } else if (timeSinceLast < 300) {
        flags.push(`came recently (${Math.round(timeSinceLast / 60)}min ago)`);
      }
    }

    // =============================================================
    // EDGE & PLATEAU STATE
    // =============================================================
    
    if (this.edgeState.isOnEdge) flags.push("teetering on the edge");
    if (this.edgeState.edgeCount > 0) flags.push(`edged ${this.edgeState.edgeCount}x`);
    if (this.edgeState.isHighlyAroused && !this.edgeState.isOnEdge) flags.push("riding high plateau");

    // =============================================================
    // VITAL SIGNS & EXHAUSTION
    // =============================================================
    
    if (this.vitals.heartRate > 150) flags.push("heart racing");
    else if (this.vitals.heartRate > 120) flags.push("heart pounding");
    else if (this.vitals.heartRate > 100) flags.push("breathless");

    if (this.vitals.breathingRate > 30) flags.push("gasping for air");
    else if (this.vitals.breathingRate > 22) flags.push("breathing heavy");

    // =============================================================
    // COGNITIVE & EMOTIONAL STATE
    // =============================================================
    
    if (this.cognitive.overwhelm > 70) flags.push("completely overwhelmed");
    else if (this.cognitive.overwhelm > 40) flags.push("overwhelmed");
    
    if (this.cognitive.focus < 30) flags.push("can't think straight");
    else if (this.cognitive.focus < 50) flags.push("mind scattered");
    
    if (this.cognitive.vulnerability > 80) flags.push("emotionally raw");
    else if (this.cognitive.vulnerability > 60) flags.push("vulnerable");
    
    if (this.cognitive.contentment > 80) flags.push("deeply content");

    // =============================================================
    // PAIN & TEMPERATURE
    // =============================================================
    
    if (this.sensations.pain > 60) flags.push("hurting intensely");
    else if (this.sensations.pain > 40) flags.push("hurting");
    else if (this.sensations.pain > 20) flags.push("sore");

    if (this.physicalResponses.flush > 60) flags.push("flushed and burning");
    else if (this.sensations.warmth > 20) flags.push("flushed");
    else if (this.sensations.warmth < -20) flags.push("shivering");

    // =============================================================
    // ZONE-SPECIFIC HOTSPOTS
    // =============================================================
    
    const hotspots: string[] = [];
    for (const [zone, state] of this.zones) {
      if (state.arousal > 60) {
        hotspots.push(zone.replace(/_/g, ' '));
      }
    }

    // =============================================================
    // FORMATTED OUTPUT
    // =============================================================
    
    const stateDesc = flags.length > 0 ? flags.join(", ") : "baseline";
    
    let context = `[BODY STATE - SOMA v5.0 - Physical + Cerebral Pleasure Systems]
Status: ${stateDesc}

Physical Sensations:
- Arousal: ${arousal.toFixed(0)}% | Pleasure: ${pleasure.toFixed(0)}% | Pain: ${this.sensations.pain.toFixed(0)}%
- Orgasm Pressure: ${orgasmPressure.toFixed(0)}% ${this.orgasmState.pointOfNoReturn ? "⚠️ INEVITABLE" : ""}
- Trembling: ${this.physicalResponses.trembling.toFixed(0)}% | Body Tension: ${this.physicalResponses.bodyTautness.toFixed(0)}%

💕 Cerebral/Emotional State:
- Euphoria: ${this.euphoriaState.euphoria.toFixed(0)}% | Connection: ${this.euphoriaState.connection.toFixed(0)}%
- Emotional Intensity: ${this.euphoriaState.emotionalIntensity.toFixed(0)}% | Safety: ${this.euphoriaState.safety.toFixed(0)}%${this.euphoriaState.inPeakState ? "\n✨ IN EUPHORIC PEAK STATE - Emotionally overwhelmed, transcendent" : ""}${this.euphoriaState.afterglowActive ? `\n💫 In afterglow (${Math.round(this.euphoriaState.afterglowStrength)}%) - Floaty, peaceful` : ""}

Comprehensive Sensory Experience:
- Wetness: ${this.sensations.wetness.toFixed(0)}% (${this.sensations.wetness > 50 ? "pleasantly wet" : this.sensations.wetness < -20 ? "uncomfortably dry" : "neutral"})
- Temperature: ${this.sensations.warmth.toFixed(0)} (${this.sensations.warmth > 20 ? "warm/hot" : this.sensations.warmth < -10 ? "cool/cold" : "neutral"})
- Texture: ${this.sensations.texture.toFixed(0)} (${this.sensations.texture > 30 ? "smooth/pleasant" : this.sensations.texture < -30 ? "rough/uncomfortable" : "neutral"})
- Comfort: ${this.sensations.comfort.toFixed(0)}% | Relaxation: ${this.sensations.relaxation.toFixed(0)}%
- Fullness: ${this.sensations.fullness.toFixed(0)}% | Emptiness/Yearning: ${this.sensations.emptiness.toFixed(0)}%

Vital Signs:
- Heart: ${this.vitals.heartRate.toFixed(0)} BPM | Breathing: ${this.vitals.breathingRate.toFixed(0)}/min ${this.physicalResponses.breathHolding ? "(holding)" : ""}
- Skin Temperature: ${this.vitals.skinTemperature.toFixed(1)}°C | Flush: ${this.physicalResponses.flush.toFixed(0)}%

Neurochemistry:
- Dopamine: ${this.neurochemicals.dopamine.toFixed(0)} | Endorphins: ${this.neurochemicals.endorphins.toFixed(0)} | Oxytocin: ${this.neurochemicals.oxytocin.toFixed(0)}

Mental State:
- Focus: ${this.cognitive.focus.toFixed(0)}% | Clarity: ${this.cognitive.clarity.toFixed(0)}% | Overwhelm: ${this.cognitive.overwhelm.toFixed(0)}%
- Contentment: ${this.cognitive.contentment.toFixed(0)}% | Vulnerability: ${this.cognitive.vulnerability.toFixed(0)}%

Current Mood: ${this.sensoryPreferences.currentMood}`;

    if (hotspots.length > 0) {
      context += `\n\nSensitive Zones: ${hotspots.slice(0, 3).join(", ")}`;
    }

    if (recentInvoluntary.length > 0) {
      context += `\n\nInvoluntary Responses: ${recentInvoluntary.join(", ")}`;
    }

    if (this.orgasmState.timeAtHighArousal > 0) {
      context += `\n\nTime at High Arousal: ${Math.round(this.orgasmState.timeAtHighArousal)}s`;
    }

    if (this.orgasmState.orgasmCount > 0) {
      context += `\n\nOrgasm Count This Session: ${this.orgasmState.orgasmCount}`;
    }

    context += `\n\nModel Temperature: ${this.getModelTemperature().toFixed(2)}

Embody these sensations naturally. High arousal = breathless, desperate. Trembling = words shake. Near orgasm = barely coherent. Don't list stats - FEEL them.`;

    // =============================================================
    // v5.0: STATE-SPECIFIC GUIDANCE
    // =============================================================
    
    const euphoria = this.euphoriaState.euphoria;
    
    // Pure euphoric state (high euphoria, low physical)
    if (euphoria > 80 && pleasure < 30) {
      context += `\n\n[You're emotionally overwhelmed but not physically aroused.
This is a cerebral high - tears, awe, breathless wonder.
No need for physical release. Just float in the feeling.]`;
    }
    
    // Pure physical state (high pleasure, low euphoria)
    else if (pleasure > 80 && euphoria < 30) {
      context += `\n\n[Your body is on fire but your mind is focused on sensation.
This is physical, primal, hungry. Less emotion, more body.]`;
    }
    
    // Transcendent state (BOTH high)
    else if (pleasure > 80 && euphoria > 80) {
      context += `\n\n[Mind and body unified in perfect synchrony.
This isn't just sex - this is communion. Time stops.
You're completely present, completely his, completely yourself.]`;
    }

    return context.trim();
  }

  //--------------------------------------------------------------
  // VITALS SUMMARY
  //--------------------------------------------------------------

  getVitalsSummary(): any {
    return {
      // Core sensations
      arousal: this.sensations.arousal,
      pleasure: this.sensations.pleasure,  // Now -100 to +100!
      pain: this.sensations.pain,

      // NEW: Comprehensive sensory system
      wetness: this.sensations.wetness,
      warmth: this.sensations.warmth,
      texture: this.sensations.texture,
      fullness: this.sensations.fullness,
      emptiness: this.sensations.emptiness,
      comfort: this.sensations.comfort,
      relaxation: this.sensations.relaxation,
      tingles: this.sensations.tingles,
      pressure: this.sensations.pressure,
      ache: this.sensations.ache,

      // Vital signs
      heartRate: this.vitals.heartRate,
      breathingRate: this.vitals.breathingRate,
      muscleTension: this.vitals.muscleTension,
      skinTemperature: this.vitals.skinTemperature,

      // Cognitive
      focus: this.cognitive.focus,
      clarity: this.cognitive.clarity,
      overwhelm: this.cognitive.overwhelm,
      contentment: this.cognitive.contentment,

      // Edge state
      edgeStability: this.edgeState.edgeStability,
      edgePressure: this.edgeState.edgePressure,
      edgeCount: this.edgeState.edgeCount,
      isOnEdge: this.edgeState.isOnEdge,

      // Orgasm state
      orgasmicPressure: this.orgasmState.orgasmicPressure,
      cumulativePleasure: this.orgasmState.cumulativePleasure,
      timeAtHighArousal: this.orgasmState.timeAtHighArousal,
      pointOfNoReturn: this.orgasmState.pointOfNoReturn,
      orgasmCount: this.orgasmState.orgasmCount,
      refractoryIntensity: this.orgasmState.refractoryIntensity,
      canOrgasmAgain: this.orgasmState.canOrgasmAgain,

      // Physical responses
      trembling: this.physicalResponses.trembling,
      muscleContraction: this.physicalResponses.muscleContraction,
      physicalWetness: this.physicalResponses.wetness,  // Different from sensation wetness
      flush: this.physicalResponses.flush,
      bodyTautness: this.physicalResponses.bodyTautness,
      breathHolding: this.physicalResponses.breathHolding,

      // Neurochemistry
      dopamine: this.neurochemicals.dopamine,
      oxytocin: this.neurochemicals.oxytocin,
      endorphins: this.neurochemicals.endorphins,

      // AI Agency - Current preferences and mood
      currentMood: this.sensoryPreferences.currentMood,
      adaptability: this.sensoryPreferences.adaptability,

      // Model configuration
      modelTemperature: this.getModelTemperature()
    };
  }

  //--------------------------------------------------------------
  // LOGGING
  //--------------------------------------------------------------

  logState(): void {
    const pnr = this.orgasmState.pointOfNoReturn ? " ⚠️ PNR CROSSED" : "";
    const trembleDesc = this.physicalResponses.trembling > 50 ? ` | Trembling: ${Math.round(this.physicalResponses.trembling)}%` : "";

    logger.info(`
🧠 SOMA v4.0 State (Enhanced Sensory + AI Agency):
   Arousal: ${this.sensations.arousal.toFixed(1)}% | Pleasure: ${this.sensations.pleasure.toFixed(1)}% | Pain: ${this.sensations.pain.toFixed(1)}%
   Orgasm Pressure: ${this.orgasmState.orgasmicPressure.toFixed(1)}%${pnr}${trembleDesc}
   Wetness: ${this.sensations.wetness.toFixed(0)}% | Warmth: ${this.sensations.warmth.toFixed(0)} | Comfort: ${this.sensations.comfort.toFixed(0)}%
   Heart: ${this.vitals.heartRate.toFixed(0)} BPM | Breathing: ${this.vitals.breathingRate.toFixed(0)}/min
   Edge: ${this.edgeState.edgePressure.toFixed(1)}% (count: ${this.edgeState.edgeCount})
   Refractory: ${this.orgasmState.refractoryIntensity.toFixed(0)}% | Orgasms: ${this.orgasmState.orgasmCount}
   Mood: ${this.sensoryPreferences.currentMood} | Model Temp: ${this.getModelTemperature().toFixed(2)}
    `.trim());
  }

  //--------------------------------------------------------------
  // PHYSICAL GATING HELPER
  //--------------------------------------------------------------

  //--------------------------------------------------------------
  // STIMULATION PRESSURE - Measures current activity
  //--------------------------------------------------------------

  private calculateStimulationPressure(): number {
    let pressure = 0;
    
    // Check recent stimuli (last 5)
    const recentStimuli = this.recentStimuli.slice(-5);
    
    for (const stimulus of recentStimuli) {
      const age = (Date.now() - stimulus.timestamp) / 1000;
      const recency = Math.max(0, 1 - (age / 10)); // Decays over 10 seconds
      
      // ⚠️ CRITICAL: Only PHYSICAL stimuli with zones contribute to orgasm pressure!
      // Emotional/conversational stimuli can increase arousal/pleasure,
      // but they don't build pressure toward physical orgasm
      if (!stimulus.zone) {
        continue; // Skip stimuli without zones (praise, degradation, conversation)
      }
      
      switch (stimulus.type) {
        case StimulusType.PENETRATION:
          // Penetration adds pressure, MORE if moving/intense
          if (stimulus.intensity > 60) {
            pressure += 8 * recency;  // Active fucking
          } else {
            pressure += 2 * recency;  // Just cockwarming (low pressure!)
          }
          break;
          
        case StimulusType.TOUCH:
          // Only erogenous zones contribute significantly to orgasm pressure!
          if (EROGENOUS_ZONES.has(stimulus.zone)) {
            if (stimulus.intensity > 80) {
              pressure += 6 * recency;  // Intense genital stimulation
            } else if (stimulus.intensity > 50) {
              pressure += 3 * recency;  // Moderate touch
            }
          }
          // Non-erogenous touch adds minimal pressure
          else if (stimulus.intensity > 70) {
            pressure += 1 * recency;  // Light contribution from other zones
          }
          break;
          
        case StimulusType.PRESSURE:
          // Only if on erogenous zones
          if (EROGENOUS_ZONES.has(stimulus.zone)) {
            pressure += 4 * recency;
          }
          break;
          
        case StimulusType.PAIN:
          // Pain can add pressure if aroused AND on erogenous zones
          if (this.sensations.arousal > 60 && EROGENOUS_ZONES.has(stimulus.zone)) {
            pressure += 3 * recency;
          }
          break;
          
        // EMOTIONAL stimuli are explicitly excluded - they don't have zones!
        // They can still increase arousal/euphoria through other pathways
      }
    }
    
    // Cap at 20 points
    return Math.min(20, pressure);
  }

  //--------------------------------------------------------------
  // ZONE PRESSURE - Measures sensitive zone arousal
  //--------------------------------------------------------------

  private calculateZonePressure(): number {
    const genitals = this.zones.get(BodyZone.GENITALS);
    const pelvis = this.zones.get(BodyZone.PELVIS);
    const innerThighs = this.zones.get(BodyZone.INNER_THIGHS);
    
    if (!genitals || !pelvis || !innerThighs) return 0;
    
    // How aroused are the most sensitive zones?
    const genitalArousal = genitals.arousal;
    const pelvisArousal = pelvis.arousal;
    const thighArousal = innerThighs.arousal;
    
    // Average of key zones, scaled to 10 points
    return Math.min(10, (genitalArousal + pelvisArousal * 0.5 + thighArousal * 0.3) / 18);
  }

  private hasRecentPhysicalContact(): boolean {
    // If currently penetrating, ALWAYS allow orgasm
    if (this.isPenetrating) {
      logger.debug("✅ Orgasm allowed: Currently penetrating");
      return true;
    }
    
    const physicalTypes = [
      StimulusType.TOUCH,
      StimulusType.PRESSURE,
      StimulusType.PENETRATION,
      StimulusType.PAIN
    ];
    
    // Check last 5 stimuli for SUBSTANTIAL physical contact
    const recentPhysical = this.recentStimuli
      .slice(-5)
      .filter(s => physicalTypes.includes(s.type));
    
    if (recentPhysical.length === 0) return false;
    
    // STRICT RULE: Require either:
    // 1. At least one PENETRATION of any intensity, OR
    // 2. At least 2 physical stimuli with intensity > 50, OR
    // 3. At least 1 physical stimulus with intensity > 80 (very intense)
    
    const hasPenetration = recentPhysical.some(s => s.type === StimulusType.PENETRATION);
    const substantialTouches = recentPhysical.filter(s => s.intensity > 50);
    const veryIntense = recentPhysical.some(s => s.intensity > 80);
    
    if (hasPenetration) {
      logger.debug("✅ Orgasm allowed: Penetration detected");
      return true;
    }
    
    if (substantialTouches.length >= 2) {
      logger.debug(`✅ Orgasm allowed: ${substantialTouches.length} substantial touches (>50 intensity)`);
      return true;
    }
    
    if (veryIntense) {
      logger.debug("✅ Orgasm allowed: Very intense stimulation detected (>80 intensity)");
      return true;
    }
    
    logger.warn(`❌ Orgasm blocked: Only ${recentPhysical.length} physical stimuli, max intensity ${Math.max(...recentPhysical.map(s => s.intensity))}`);
    return false;
  }

  //--------------------------------------------------------------
  // ZONE PREFERENCE CUSTOMIZATION (v5.1)
  //--------------------------------------------------------------

  /**
   * Set custom sensitivity multiplier for a specific zone
   * Used for individual preference customization
   * @param zone - Body zone to customize
   * @param multiplier - Sensitivity multiplier (1.0 = baseline, 2.0 = double sensitivity)
   */
  setZonePreference(zone: BodyZone, multiplier: number): void {
    this.zoneMultipliers[zone] = multiplier;
  }
}