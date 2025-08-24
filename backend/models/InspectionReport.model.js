const mongoose = require('mongoose');
const crypto = require('crypto');

const inspectionReportSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  reportNumber: {
    type: String,
    unique: true
  },
  shareableLink: {
    type: String,
    unique: true,
    sparse: true
  },
  overallRating: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  overallCondition: {
    type: String,
    enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
    required: true
  },
  inspectionSummary: {
    totalCheckpoints: { type: Number, default: 200 },
    passedCheckpoints: { type: Number, default: 0 },
    failedCheckpoints: { type: Number, default: 0 },
    warningCheckpoints: { type: Number, default: 0 },
    notApplicableCheckpoints: { type: Number, default: 0 }
  },
  carImages: [{
    category: {
      type: String,
      enum: ['front', 'rear', 'left', 'right', 'front-left', 'front-right', 'rear-left', 'rear-right', 
              'interior-front', 'interior-rear', 'dashboard', 'engine', 'trunk', 'undercarriage', 'wheels', 'other']
    },
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Exterior Inspection (50+ checkpoints)
  exterior: {
    body: {
      frontBumper: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        issues: [String],
        notes: String,
        images: [String]
      },
      rearBumper: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        issues: [String],
        notes: String,
        images: [String]
      },
      hood: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        alignment: { type: String, enum: ['Aligned', 'Misaligned', 'N/A'] },
        issues: [String],
        notes: String,
        images: [String]
      },
      roof: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        sunroof: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        issues: [String],
        notes: String,
        images: [String]
      },
      trunk: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        alignment: { type: String, enum: ['Aligned', 'Misaligned', 'N/A'] },
        lock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        issues: [String],
        notes: String,
        images: [String]
      },
      doors: {
        frontLeft: {
          condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
          alignment: { type: String, enum: ['Aligned', 'Misaligned', 'N/A'] },
          lock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          issues: [String]
        },
        frontRight: {
          condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
          alignment: { type: String, enum: ['Aligned', 'Misaligned', 'N/A'] },
          lock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          issues: [String]
        },
        rearLeft: {
          condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
          alignment: { type: String, enum: ['Aligned', 'Misaligned', 'N/A'] },
          lock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          issues: [String]
        },
        rearRight: {
          condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
          alignment: { type: String, enum: ['Aligned', 'Misaligned', 'N/A'] },
          lock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          issues: [String]
        },
        notes: String,
        images: [String]
      },
      fenders: {
        frontLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        frontRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        rearLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        rearRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        notes: String,
        images: [String]
      },
      pillars: {
        aPillarLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        aPillarRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        bPillarLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        bPillarRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        cPillarLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        cPillarRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        notes: String
      },
      runningBoards: {
        left: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] },
        right: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, issues: [String] }
      },
      wheelArches: {
        frontLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, rustPresent: Boolean },
        frontRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, rustPresent: Boolean },
        rearLeft: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, rustPresent: Boolean },
        rearRight: { condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] }, rustPresent: Boolean }
      }
    },
    paint: {
      overallCondition: { type: String, enum: ['Original', 'Partial Repaint', 'Full Repaint', 'Poor'] },
      paintMeterReadings: {
        hood: Number,
        roof: Number,
        trunk: Number,
        frontBumper: Number,
        rearBumper: Number,
        frontLeftDoor: Number,
        frontRightDoor: Number,
        rearLeftDoor: Number,
        rearRightDoor: Number,
        frontLeftFender: Number,
        frontRightFender: Number,
        rearLeftFender: Number,
        rearRightFender: Number
      },
      colorMatch: { type: Boolean, default: true },
      clearCoatCondition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
      scratchesAndDents: [{
        location: String,
        severity: { type: String, enum: ['Minor', 'Moderate', 'Severe'] },
        size: String
      }],
      rustSpots: [{
        location: String,
        severity: { type: String, enum: ['Surface', 'Moderate', 'Severe'] }
      }],
      notes: String,
      images: [String]
    },
    glass: {
      windshield: {
        condition: { type: String, enum: ['Good', 'Cracked', 'Chipped', 'Replaced', 'N/A'] },
        tint: { type: String, enum: ['Factory', 'Aftermarket', 'None', 'N/A'] },
        wipers: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        washerJets: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        issues: [String]
      },
      rearWindow: {
        condition: { type: String, enum: ['Good', 'Cracked', 'Chipped', 'Replaced', 'N/A'] },
        tint: { type: String, enum: ['Factory', 'Aftermarket', 'None', 'N/A'] },
        defogger: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        wiper: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        issues: [String]
      },
      sideWindows: {
        frontLeft: { condition: { type: String, enum: ['Good', 'Cracked', 'Chipped', 'N/A'] }, operation: { type: String, enum: ['Smooth', 'Slow', 'Not Working', 'N/A'] } },
        frontRight: { condition: { type: String, enum: ['Good', 'Cracked', 'Chipped', 'N/A'] }, operation: { type: String, enum: ['Smooth', 'Slow', 'Not Working', 'N/A'] } },
        rearLeft: { condition: { type: String, enum: ['Good', 'Cracked', 'Chipped', 'N/A'] }, operation: { type: String, enum: ['Smooth', 'Slow', 'Not Working', 'N/A'] } },
        rearRight: { condition: { type: String, enum: ['Good', 'Cracked', 'Chipped', 'N/A'] }, operation: { type: String, enum: ['Smooth', 'Slow', 'Not Working', 'N/A'] } }
      },
      mirrors: {
        leftSide: { condition: { type: String, enum: ['Good', 'Cracked', 'Broken', 'N/A'] }, adjustment: { type: String, enum: ['Working', 'Not Working', 'N/A'] } },
        rightSide: { condition: { type: String, enum: ['Good', 'Cracked', 'Broken', 'N/A'] }, adjustment: { type: String, enum: ['Working', 'Not Working', 'N/A'] } },
        rearView: { condition: { type: String, enum: ['Good', 'Cracked', 'Broken', 'N/A'] }, autoDim: { type: String, enum: ['Working', 'Not Working', 'N/A'] } }
      },
      notes: String,
      images: [String]
    },
    lights: {
      headlights: {
        leftLow: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        leftHigh: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        rightLow: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        rightHigh: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        condition: { type: String, enum: ['Clear', 'Foggy', 'Yellowed', 'Cracked', 'N/A'] },
        leveling: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      taillights: {
        left: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        right: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        condition: { type: String, enum: ['Good', 'Cracked', 'Faded', 'N/A'] }
      },
      brakeLights: {
        left: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        right: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        center: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] }
      },
      turnSignals: {
        frontLeft: { type: String, enum: ['Working', 'Fast', 'Slow', 'Not Working', 'N/A'] },
        frontRight: { type: String, enum: ['Working', 'Fast', 'Slow', 'Not Working', 'N/A'] },
        rearLeft: { type: String, enum: ['Working', 'Fast', 'Slow', 'Not Working', 'N/A'] },
        rearRight: { type: String, enum: ['Working', 'Fast', 'Slow', 'Not Working', 'N/A'] }
      },
      fogLights: {
        front: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        rear: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      hazardLights: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      licensePlateLight: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      notes: String,
      images: [String]
    }
  },

  // Interior Inspection (50+ checkpoints)
  interior: {
    seats: {
      driverSeat: {
        condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'N/A'] },
        material: { type: String, enum: ['Leather', 'Fabric', 'Vinyl', 'Mixed', 'N/A'] },
        tears: Boolean,
        stains: Boolean,
        burns: Boolean,
        adjustment: {
          manual: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          power: { type: String, enum: ['Working', 'Partial', 'Not Working', 'N/A'] },
          memory: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          heating: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          cooling: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          lumbar: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
        },
        issues: [String]
      },
      passengerSeat: {
        condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'N/A'] },
        tears: Boolean,
        stains: Boolean,
        burns: Boolean,
        adjustment: {
          manual: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          power: { type: String, enum: ['Working', 'Partial', 'Not Working', 'N/A'] },
          heating: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          cooling: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
        },
        issues: [String]
      },
      rearSeats: {
        condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'N/A'] },
        tears: Boolean,
        stains: Boolean,
        burns: Boolean,
        folding: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        headrests: { type: String, enum: ['Present', 'Missing', 'Damaged', 'N/A'] },
        issues: [String]
      },
      seatBelts: {
        driverSide: { type: String, enum: ['Working', 'Slow Retraction', 'Not Working', 'N/A'] },
        passengerSide: { type: String, enum: ['Working', 'Slow Retraction', 'Not Working', 'N/A'] },
        rearLeft: { type: String, enum: ['Working', 'Slow Retraction', 'Not Working', 'N/A'] },
        rearCenter: { type: String, enum: ['Working', 'Slow Retraction', 'Not Working', 'N/A'] },
        rearRight: { type: String, enum: ['Working', 'Slow Retraction', 'Not Working', 'N/A'] }
      },
      notes: String,
      images: [String]
    },
    dashboard: {
      condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'N/A'] },
      cracks: Boolean,
      warping: Boolean,
      fading: Boolean,
      instrumentCluster: {
        speedometer: { type: String, enum: ['Working', 'Intermittent', 'Not Working', 'N/A'] },
        tachometer: { type: String, enum: ['Working', 'Intermittent', 'Not Working', 'N/A'] },
        fuelGauge: { type: String, enum: ['Working', 'Intermittent', 'Not Working', 'N/A'] },
        temperatureGauge: { type: String, enum: ['Working', 'Intermittent', 'Not Working', 'N/A'] },
        odometerDisplay: { type: String, enum: ['Clear', 'Dim', 'Partially Working', 'Not Working', 'N/A'] },
        warningLights: { type: String, enum: ['All Working', 'Some Not Working', 'None Working', 'N/A'] },
        backlighting: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] }
      },
      centerConsole: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        storageCompartments: { type: String, enum: ['Good', 'Damaged', 'N/A'] },
        cupHolders: { type: String, enum: ['Good', 'Damaged', 'N/A'] },
        armrest: { type: String, enum: ['Good', 'Loose', 'Damaged', 'N/A'] },
        usbPorts: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        chargingPorts: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      glovebox: {
        condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'N/A'] },
        lock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        light: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      notes: String,
      images: [String]
    },
    steeringAndControls: {
      steeringWheel: {
        condition: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] },
        adjustment: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        controls: {
          audioControls: { type: String, enum: ['Working', 'Partial', 'Not Working', 'N/A'] },
          cruiseControl: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          phoneControls: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
          paddleShifters: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
        },
        horn: { type: String, enum: ['Working', 'Weak', 'Not Working', 'N/A'] },
        airbag: { type: String, enum: ['Present', 'Deployed', 'Tampered', 'N/A'] }
      },
      gearShifter: {
        condition: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] },
        operation: { type: String, enum: ['Smooth', 'Stiff', 'Loose', 'N/A'] },
        bootCondition: { type: String, enum: ['Good', 'Torn', 'Missing', 'N/A'] }
      },
      handbrake: {
        type: { type: String, enum: ['Manual', 'Electronic', 'Foot', 'N/A'] },
        operation: { type: String, enum: ['Working', 'Weak', 'Not Working', 'N/A'] },
        condition: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] }
      },
      pedals: {
        accelerator: { type: String, enum: ['Good', 'Worn', 'Sticking', 'N/A'] },
        brake: { type: String, enum: ['Good', 'Worn', 'Spongy', 'N/A'] },
        clutch: { type: String, enum: ['Good', 'Worn', 'Slipping', 'N/A'] },
        rubberPads: { type: String, enum: ['Good', 'Worn', 'Missing', 'N/A'] }
      },
      notes: String,
      images: [String]
    },
    hvac: {
      airConditioning: {
        cooling: { type: String, enum: ['Excellent', 'Good', 'Weak', 'Not Working', 'N/A'] },
        heating: { type: String, enum: ['Excellent', 'Good', 'Weak', 'Not Working', 'N/A'] },
        fanSpeeds: { type: String, enum: ['All Working', 'Some Not Working', 'None Working', 'N/A'] },
        ventDirection: { type: String, enum: ['Working', 'Stuck', 'Not Working', 'N/A'] },
        defrost: { type: String, enum: ['Working', 'Slow', 'Not Working', 'N/A'] },
        rearAC: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        climateControl: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        cabinFilter: { type: String, enum: ['Clean', 'Dirty', 'Missing', 'N/A'] }
      },
      vents: {
        dashboardVents: { type: String, enum: ['All Working', 'Some Blocked', 'N/A'] },
        floorVents: { type: String, enum: ['Working', 'Blocked', 'N/A'] },
        rearVents: { type: String, enum: ['Working', 'Blocked', 'N/A'] }
      },
      odor: { type: String, enum: ['None', 'Mild', 'Strong', 'N/A'] },
      notes: String
    },
    electricalAndElectronics: {
      infotainmentSystem: {
        display: { type: String, enum: ['Working', 'Intermittent', 'Dead Pixels', 'Not Working', 'N/A'] },
        touchscreen: { type: String, enum: ['Responsive', 'Slow', 'Unresponsive', 'N/A'] },
        radio: { type: String, enum: ['Working', 'Poor Reception', 'Not Working', 'N/A'] },
        bluetooth: { type: String, enum: ['Working', 'Connection Issues', 'Not Working', 'N/A'] },
        navigation: { type: String, enum: ['Working', 'Outdated', 'Not Working', 'N/A'] },
        backupCamera: { type: String, enum: ['Clear', 'Blurry', 'Intermittent', 'Not Working', 'N/A'] },
        parkingSensors: { type: String, enum: ['Working', 'Partial', 'Not Working', 'N/A'] },
        speakers: {
          frontLeft: { type: String, enum: ['Clear', 'Distorted', 'Not Working', 'N/A'] },
          frontRight: { type: String, enum: ['Clear', 'Distorted', 'Not Working', 'N/A'] },
          rearLeft: { type: String, enum: ['Clear', 'Distorted', 'Not Working', 'N/A'] },
          rearRight: { type: String, enum: ['Clear', 'Distorted', 'Not Working', 'N/A'] },
          subwoofer: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
        }
      },
      powerOutlets: {
        cigaretteLighter: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        usbPorts: { type: String, enum: ['All Working', 'Some Not Working', 'None Working', 'N/A'] },
        powerOutlets12V: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      interiorLights: {
        domeLight: { type: String, enum: ['Working', 'Dim', 'Not Working', 'N/A'] },
        mapLights: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        doorLights: { type: String, enum: ['All Working', 'Some Not Working', 'N/A'] },
        trunkLight: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        gloveboxLight: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        vanityLights: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      notes: String,
      images: [String]
    },
    floorsAndCarpets: {
      driverSide: { condition: { type: String, enum: ['Clean', 'Stained', 'Torn', 'Wet', 'N/A'] }, mat: { type: String, enum: ['Present', 'Missing', 'Damaged', 'N/A'] } },
      passengerSide: { condition: { type: String, enum: ['Clean', 'Stained', 'Torn', 'Wet', 'N/A'] }, mat: { type: String, enum: ['Present', 'Missing', 'Damaged', 'N/A'] } },
      rearFloor: { condition: { type: String, enum: ['Clean', 'Stained', 'Torn', 'Wet', 'N/A'] }, mats: { type: String, enum: ['Present', 'Missing', 'Damaged', 'N/A'] } },
      trunk: { 
        condition: { type: String, enum: ['Clean', 'Stained', 'Torn', 'Wet', 'N/A'] },
        mat: { type: String, enum: ['Present', 'Missing', 'Damaged', 'N/A'] },
        spareTire: { type: String, enum: ['Present', 'Missing', 'Damaged', 'N/A'] },
        jack: { type: String, enum: ['Present', 'Missing', 'N/A'] },
        tools: { type: String, enum: ['Complete', 'Partial', 'Missing', 'N/A'] }
      },
      notes: String,
      images: [String]
    },
    doorsAndWindows: {
      doorPanels: {
        driverDoor: { condition: { type: String, enum: ['Good', 'Scratched', 'Damaged', 'N/A'] }, armrest: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] } },
        passengerDoor: { condition: { type: String, enum: ['Good', 'Scratched', 'Damaged', 'N/A'] }, armrest: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] } },
        rearLeftDoor: { condition: { type: String, enum: ['Good', 'Scratched', 'Damaged', 'N/A'] }, armrest: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] } },
        rearRightDoor: { condition: { type: String, enum: ['Good', 'Scratched', 'Damaged', 'N/A'] }, armrest: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] } }
      },
      windowControls: {
        driverMaster: { type: String, enum: ['All Working', 'Some Not Working', 'None Working', 'N/A'] },
        individualControls: { type: String, enum: ['All Working', 'Some Not Working', 'None Working', 'N/A'] },
        childLock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        autoUp: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        autoDown: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      doorLocks: {
        centralLocking: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        keylessEntry: { type: String, enum: ['Working', 'Range Issues', 'Not Working', 'N/A'] },
        autoLock: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
        childSafetyLocks: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      },
      notes: String,
      images: [String]
    },
    roofAndHeadliner: {
      headliner: {
        condition: { type: String, enum: ['Good', 'Sagging', 'Stained', 'Torn', 'N/A'] },
        color: { type: String, enum: ['Clean', 'Discolored', 'N/A'] }
      },
      sunVisors: {
        driverSide: { 
          condition: { type: String, enum: ['Good', 'Loose', 'Broken', 'N/A'] },
          mirror: { type: String, enum: ['Present', 'Broken', 'Missing', 'N/A'] },
          light: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
        },
        passengerSide: {
          condition: { type: String, enum: ['Good', 'Loose', 'Broken', 'N/A'] },
          mirror: { type: String, enum: ['Present', 'Broken', 'Missing', 'N/A'] },
          light: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
        }
      },
      sunroof: {
        operation: { type: String, enum: ['Smooth', 'Slow', 'Noisy', 'Not Working', 'N/A'] },
        seal: { type: String, enum: ['Good', 'Leaking', 'Damaged', 'N/A'] },
        shade: { type: String, enum: ['Working', 'Stuck', 'Torn', 'N/A'] }
      },
      notes: String,
      images: [String]
    }
  },

  // Engine & Mechanical (50+ checkpoints)
  engine: {
    general: {
      startUp: {
        coldStart: { type: String, enum: ['Easy', 'Delayed', 'Difficult', 'N/A'] },
        hotStart: { type: String, enum: ['Easy', 'Delayed', 'Difficult', 'N/A'] },
        idleQuality: { type: String, enum: ['Smooth', 'Rough', 'Hunting', 'N/A'] },
        idleRPM: Number,
        engineNoise: { type: String, enum: ['Normal', 'Ticking', 'Knocking', 'Squealing', 'N/A'] }
      },
      engineBay: {
        cleanliness: { type: String, enum: ['Clean', 'Dusty', 'Oil Stains', 'Very Dirty', 'N/A'] },
        modifications: { type: String, enum: ['None', 'Minor', 'Major', 'N/A'] },
        rustOrCorrosion: { type: String, enum: ['None', 'Minor', 'Moderate', 'Severe', 'N/A'] }
      },
      mounts: {
        condition: { type: String, enum: ['Good', 'Worn', 'Broken', 'N/A'] },
        vibration: { type: String, enum: ['None', 'Mild', 'Excessive', 'N/A'] }
      }
    },
    oilSystem: {
      engineOil: {
        level: { type: String, enum: ['Full', 'Adequate', 'Low', 'Empty', 'N/A'] },
        condition: { type: String, enum: ['Clean', 'Slightly Dirty', 'Dirty', 'Very Dirty', 'N/A'] },
        color: { type: String, enum: ['Clear/Amber', 'Dark Brown', 'Black', 'Milky', 'N/A'] },
        lastChangeKm: Number,
        leaks: { type: String, enum: ['None', 'Minor', 'Moderate', 'Severe', 'N/A'] }
      },
      oilFilter: {
        condition: { type: String, enum: ['New', 'Good', 'Due for Change', 'N/A'] },
        lastChangeDate: Date
      },
      oilPressure: {
        idle: Number,
        running: Number,
        warningLight: { type: String, enum: ['Off', 'On', 'Intermittent', 'N/A'] }
      }
    },
    coolingSystem: {
      coolant: {
        level: { type: String, enum: ['Full', 'Adequate', 'Low', 'Empty', 'N/A'] },
        condition: { type: String, enum: ['Clean', 'Slightly Dirty', 'Dirty', 'Rusty', 'N/A'] },
        color: { type: String, enum: ['Green', 'Red', 'Orange', 'Blue', 'Brown', 'N/A'] },
        concentration: Number,
        leaks: { type: String, enum: ['None', 'Minor', 'Moderate', 'Severe', 'N/A'] }
      },
      radiator: {
        condition: { type: String, enum: ['Good', 'Minor Damage', 'Major Damage', 'Leaking', 'N/A'] },
        cap: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] },
        fins: { type: String, enum: ['Clean', 'Partially Blocked', 'Blocked', 'N/A'] },
        fans: {
          electric: { type: String, enum: ['Working', 'Intermittent', 'Not Working', 'N/A'] },
          viscous: { type: String, enum: ['Working', 'Slipping', 'Not Working', 'N/A'] }
        }
      },
      thermostat: {
        operation: { type: String, enum: ['Working', 'Stuck Open', 'Stuck Closed', 'N/A'] },
        operatingTemp: Number
      },
      hoses: {
        upperRadiator: { type: String, enum: ['Good', 'Soft', 'Hard', 'Leaking', 'N/A'] },
        lowerRadiator: { type: String, enum: ['Good', 'Soft', 'Hard', 'Leaking', 'N/A'] },
        heaterHoses: { type: String, enum: ['Good', 'Soft', 'Hard', 'Leaking', 'N/A'] },
        bypassHose: { type: String, enum: ['Good', 'Soft', 'Hard', 'Leaking', 'N/A'] }
      },
      waterPump: {
        condition: { type: String, enum: ['Good', 'Noisy', 'Leaking', 'N/A'] },
        weepHole: { type: String, enum: ['Dry', 'Damp', 'Leaking', 'N/A'] }
      }
    },
    beltsAndChains: {
      timingBelt: {
        condition: { type: String, enum: ['Good', 'Worn', 'Cracked', 'Due for Change', 'N/A'] },
        lastChangeKm: Number,
        tension: { type: String, enum: ['Correct', 'Loose', 'Tight', 'N/A'] }
      },
      serpentineBelt: {
        condition: { type: String, enum: ['Good', 'Glazed', 'Cracked', 'Frayed', 'N/A'] },
        tension: { type: String, enum: ['Correct', 'Loose', 'Tight', 'N/A'] },
        tensioner: { type: String, enum: ['Good', 'Worn', 'Noisy', 'N/A'] }
      },
      otherBelts: [{
        name: String,
        condition: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] }
      }]
    },
    airIntake: {
      airFilter: {
        condition: { type: String, enum: ['Clean', 'Slightly Dirty', 'Dirty', 'Very Dirty', 'N/A'] },
        type: { type: String, enum: ['Paper', 'Cotton', 'Foam', 'N/A'] },
        lastChangeKm: Number
      },
      intakeManifold: {
        condition: { type: String, enum: ['Good', 'Carbon Buildup', 'Damaged', 'N/A'] },
        leaks: { type: String, enum: ['None', 'Minor', 'Major', 'N/A'] }
      },
      throttleBody: {
        condition: { type: String, enum: ['Clean', 'Dirty', 'Carbon Buildup', 'N/A'] },
        operation: { type: String, enum: ['Smooth', 'Sticky', 'N/A'] }
      },
      massAirFlowSensor: {
        condition: { type: String, enum: ['Clean', 'Dirty', 'Faulty', 'N/A'] }
      },
      turbocharger: {
        condition: { type: String, enum: ['Good', 'Noisy', 'Leaking Oil', 'Not Working', 'N/A'] },
        boost: { type: String, enum: ['Normal', 'Low', 'Overboost', 'N/A'] },
        wastegate: { type: String, enum: ['Working', 'Stuck', 'N/A'] }
      }
    },
    fuelSystem: {
      fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'CNG', 'LPG', 'Electric'] },
      fuelTank: {
        condition: { type: String, enum: ['Good', 'Minor Damage', 'Major Damage', 'Leaking', 'N/A'] },
        cap: { type: String, enum: ['Good', 'Damaged', 'Missing', 'N/A'] }
      },
      fuelLines: {
        condition: { type: String, enum: ['Good', 'Cracked', 'Leaking', 'N/A'] },
        connections: { type: String, enum: ['Secure', 'Loose', 'Leaking', 'N/A'] }
      },
      fuelFilter: {
        condition: { type: String, enum: ['Good', 'Due for Change', 'Clogged', 'N/A'] },
        lastChangeKm: Number
      },
      fuelPump: {
        operation: { type: String, enum: ['Working', 'Noisy', 'Weak', 'Not Working', 'N/A'] },
        pressure: Number
      },
      injectors: {
        condition: { type: String, enum: ['Good', 'Dirty', 'Leaking', 'N/A'] },
        pattern: { type: String, enum: ['Good', 'Poor', 'N/A'] }
      }
    },
    exhaustSystem: {
      manifold: {
        condition: { type: String, enum: ['Good', 'Cracked', 'Leaking', 'N/A'] },
        gaskets: { type: String, enum: ['Good', 'Leaking', 'N/A'] }
      },
      catalyticConverter: {
        condition: { type: String, enum: ['Good', 'Damaged', 'Missing', 'N/A'] },
        efficiency: { type: String, enum: ['Good', 'Marginal', 'Failed', 'N/A'] }
      },
      muffler: {
        condition: { type: String, enum: ['Good', 'Rusted', 'Damaged', 'Modified', 'N/A'] },
        noise: { type: String, enum: ['Normal', 'Loud', 'Very Loud', 'N/A'] }
      },
      pipes: {
        condition: { type: String, enum: ['Good', 'Rusted', 'Damaged', 'Leaking', 'N/A'] },
        hangers: { type: String, enum: ['Good', 'Worn', 'Broken', 'N/A'] }
      },
      emissions: {
        smoke: { type: String, enum: ['None', 'White', 'Blue', 'Black', 'N/A'] },
        smell: { type: String, enum: ['Normal', 'Rich', 'Burning Oil', 'Sweet', 'N/A'] }
      }
    },
    ignitionSystem: {
      sparkPlugs: {
        condition: { type: String, enum: ['Good', 'Worn', 'Fouled', 'N/A'] },
        gap: Number,
        lastChangeKm: Number
      },
      ignitionCoils: {
        condition: { type: String, enum: ['Good', 'Weak', 'Failed', 'N/A'] },
        resistance: Number
      },
      sparkPlugWires: {
        condition: { type: String, enum: ['Good', 'Cracked', 'Arcing', 'N/A'] },
        resistance: Number
      },
      distributor: {
        cap: { type: String, enum: ['Good', 'Cracked', 'Carbon Tracked', 'N/A'] },
        rotor: { type: String, enum: ['Good', 'Worn', 'Damaged', 'N/A'] }
      }
    },
    notes: String,
    images: [String]
  },

  // Transmission & Drivetrain (30+ checkpoints)
  transmission: {
    type: { type: String, enum: ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT'] },
    general: {
      operation: { type: String, enum: ['Smooth', 'Rough', 'Slipping', 'N/A'] },
      shiftQuality: { type: String, enum: ['Smooth', 'Hard', 'Delayed', 'N/A'] },
      noise: { type: String, enum: ['None', 'Whining', 'Grinding', 'Clunking', 'N/A'] }
    },
    fluid: {
      level: { type: String, enum: ['Full', 'Adequate', 'Low', 'Empty', 'N/A'] },
      condition: { type: String, enum: ['Clean', 'Slightly Dirty', 'Dirty', 'Burnt', 'N/A'] },
      color: { type: String, enum: ['Red/Pink', 'Brown', 'Black', 'N/A'] },
      smell: { type: String, enum: ['Normal', 'Burnt', 'N/A'] },
      leaks: { type: String, enum: ['None', 'Minor', 'Moderate', 'Severe', 'N/A'] },
      lastChangeKm: Number
    },
    clutch: {
      pedal: {
        freePlay: Number,
        engagement: { type: String, enum: ['Smooth', 'Grabbing', 'Slipping', 'N/A'] },
        feel: { type: String, enum: ['Normal', 'Heavy', 'Light', 'N/A'] }
      },
      disc: {
        condition: { type: String, enum: ['Good', 'Worn', 'Slipping', 'N/A'] },
        thickness: Number
      },
      hydraulics: {
        masterCylinder: { type: String, enum: ['Good', 'Leaking', 'N/A'] },
        slaveCylinder: { type: String, enum: ['Good', 'Leaking', 'N/A'] },
        fluid: { type: String, enum: ['Clean', 'Dirty', 'Low', 'N/A'] }
      }
    },
    gearShifting: {
      first: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      second: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      third: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      fourth: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      fifth: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      sixth: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      reverse: { type: String, enum: ['Smooth', 'Hard', 'Grinding', 'N/A'] },
      syncros: { type: String, enum: ['Good', 'Worn', 'N/A'] }
    },
    transferCase: {
      operation: { type: String, enum: ['Smooth', 'Noisy', 'Hard to Engage', 'N/A'] },
      fluid: {
        level: { type: String, enum: ['Full', 'Low', 'N/A'] },
        condition: { type: String, enum: ['Clean', 'Dirty', 'N/A'] }
      },
      fourWheelDrive: {
        engagement: { type: String, enum: ['Easy', 'Hard', 'Not Working', 'N/A'] },
        lowRange: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      }
    },
    differential: {
      front: {
        noise: { type: String, enum: ['None', 'Whining', 'Clunking', 'N/A'] },
        fluid: { type: String, enum: ['Clean', 'Dirty', 'Low', 'N/A'] },
        leaks: { type: String, enum: ['None', 'Minor', 'Major', 'N/A'] }
      },
      rear: {
        noise: { type: String, enum: ['None', 'Whining', 'Clunking', 'N/A'] },
        fluid: { type: String, enum: ['Clean', 'Dirty', 'Low', 'N/A'] },
        leaks: { type: String, enum: ['None', 'Minor', 'Major', 'N/A'] },
        limitedSlip: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
      }
    },
    driveShafts: {
      front: {
        left: {
          cvJoints: { type: String, enum: ['Good', 'Clicking', 'Worn', 'N/A'] },
          boots: { type: String, enum: ['Good', 'Torn', 'Leaking', 'N/A'] }
        },
        right: {
          cvJoints: { type: String, enum: ['Good', 'Clicking', 'Worn', 'N/A'] },
          boots: { type: String, enum: ['Good', 'Torn', 'Leaking', 'N/A'] }
        }
      },
      propShaft: {
        condition: { type: String, enum: ['Good', 'Bent', 'Damaged', 'N/A'] },
        uJoints: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
        centerBearing: { type: String, enum: ['Good', 'Worn', 'Noisy', 'N/A'] },
        balance: { type: String, enum: ['Good', 'Vibration', 'N/A'] }
      }
    },
    notes: String,
    images: [String]
  },

  // Suspension & Steering (30+ checkpoints)
  suspension: {
    frontSuspension: {
      type: { type: String, enum: ['MacPherson', 'Double Wishbone', 'Multi-link', 'Solid Axle', 'Other'] },
      shockAbsorbers: {
        left: { type: String, enum: ['Good', 'Leaking', 'Weak', 'Broken', 'N/A'] },
        right: { type: String, enum: ['Good', 'Leaking', 'Weak', 'Broken', 'N/A'] }
      },
      springs: {
        left: { type: String, enum: ['Good', 'Sagging', 'Broken', 'N/A'] },
        right: { type: String, enum: ['Good', 'Sagging', 'Broken', 'N/A'] }
      },
      strutMounts: {
        left: { type: String, enum: ['Good', 'Worn', 'Noisy', 'N/A'] },
        right: { type: String, enum: ['Good', 'Worn', 'Noisy', 'N/A'] }
      },
      controlArms: {
        upperLeft: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        upperRight: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        lowerLeft: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        lowerRight: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] }
      },
      ballJoints: {
        upperLeft: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
        upperRight: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
        lowerLeft: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
        lowerRight: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] }
      },
      swayBar: {
        condition: { type: String, enum: ['Good', 'Bent', 'Broken', 'N/A'] },
        links: {
          left: { type: String, enum: ['Good', 'Worn', 'Broken', 'N/A'] },
          right: { type: String, enum: ['Good', 'Worn', 'Broken', 'N/A'] }
        },
        bushings: { type: String, enum: ['Good', 'Worn', 'Missing', 'N/A'] }
      }
    },
    rearSuspension: {
      type: { type: String, enum: ['Independent', 'Solid Axle', 'Torsion Beam', 'Multi-link', 'Other'] },
      shockAbsorbers: {
        left: { type: String, enum: ['Good', 'Leaking', 'Weak', 'Broken', 'N/A'] },
        right: { type: String, enum: ['Good', 'Leaking', 'Weak', 'Broken', 'N/A'] }
      },
      springs: {
        left: { type: String, enum: ['Good', 'Sagging', 'Broken', 'N/A'] },
        right: { type: String, enum: ['Good', 'Sagging', 'Broken', 'N/A'] },
        leafSprings: {
          condition: { type: String, enum: ['Good', 'Sagging', 'Broken Leaf', 'N/A'] },
          bushings: { type: String, enum: ['Good', 'Worn', 'Missing', 'N/A'] },
          uBolts: { type: String, enum: ['Tight', 'Loose', 'Broken', 'N/A'] }
        }
      },
      controlArms: {
        upperLeft: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        upperRight: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        lowerLeft: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        lowerRight: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
        trailingArms: {
          left: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] },
          right: { type: String, enum: ['Good', 'Bent', 'Bushings Worn', 'N/A'] }
        }
      },
      swayBar: {
        condition: { type: String, enum: ['Good', 'Bent', 'Broken', 'N/A'] },
        links: {
          left: { type: String, enum: ['Good', 'Worn', 'Broken', 'N/A'] },
          right: { type: String, enum: ['Good', 'Worn', 'Broken', 'N/A'] }
        },
        bushings: { type: String, enum: ['Good', 'Worn', 'Missing', 'N/A'] }
      }
    },
    steering: {
      type: { type: String, enum: ['Manual', 'Hydraulic Power', 'Electric Power', 'Electro-Hydraulic'] },
      steeringPlay: {
        amount: Number,
        acceptable: { type: Boolean, default: true }
      },
      steeringBox: {
        condition: { type: String, enum: ['Good', 'Worn', 'Leaking', 'N/A'] },
        adjustment: { type: String, enum: ['Correct', 'Loose', 'Tight', 'N/A'] }
      },
      rack: {
        condition: { type: String, enum: ['Good', 'Worn', 'Leaking', 'N/A'] },
        boots: {
          left: { type: String, enum: ['Good', 'Torn', 'Missing', 'N/A'] },
          right: { type: String, enum: ['Good', 'Torn', 'Missing', 'N/A'] }
        },
        innerTieRods: {
          left: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
          right: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] }
        },
        outerTieRods: {
          left: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
          right: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] }
        }
      },
      powerSteering: {
        pump: { type: String, enum: ['Working', 'Noisy', 'Leaking', 'N/A'] },
        fluid: {
          level: { type: String, enum: ['Full', 'Low', 'Empty', 'N/A'] },
          condition: { type: String, enum: ['Clean', 'Dirty', 'Foamy', 'N/A'] }
        },
        hoses: { type: String, enum: ['Good', 'Leaking', 'Swollen', 'N/A'] },
        belt: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] }
      },
      alignment: {
        pulling: { type: String, enum: ['None', 'Left', 'Right', 'N/A'] },
        steeringWheelCenter: { type: Boolean, default: true },
        tirewearPattern: { type: String, enum: ['Even', 'Inner Edge', 'Outer Edge', 'Cupping', 'N/A'] }
      }
    },
    notes: String,
    images: [String]
  },

  // Brakes (20+ checkpoints)
  brakes: {
    general: {
      pedalFeel: { type: String, enum: ['Firm', 'Soft', 'Spongy', 'Goes to Floor', 'N/A'] },
      pedalTravel: { type: String, enum: ['Normal', 'Excessive', 'N/A'] },
      brakingPerformance: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'N/A'] },
      pulling: { type: String, enum: ['None', 'Left', 'Right', 'N/A'] },
      noise: { type: String, enum: ['None', 'Squeaking', 'Grinding', 'Squealing', 'N/A'] },
      vibration: { type: String, enum: ['None', 'Mild', 'Severe', 'N/A'] }
    },
    fluid: {
      level: { type: String, enum: ['Full', 'Adequate', 'Low', 'Empty', 'N/A'] },
      condition: { type: String, enum: ['Clear', 'Slightly Dark', 'Dark', 'Contaminated', 'N/A'] },
      moisture: Number,
      lastChangeDate: Date,
      leaks: { type: String, enum: ['None', 'Minor', 'Major', 'N/A'] }
    },
    frontBrakes: {
      type: { type: String, enum: ['Disc', 'Drum', 'N/A'] },
      pads: {
        left: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Worn', 'Needs Replacement', 'N/A'] },
          wearPattern: { type: String, enum: ['Even', 'Uneven', 'N/A'] }
        },
        right: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Worn', 'Needs Replacement', 'N/A'] },
          wearPattern: { type: String, enum: ['Even', 'Uneven', 'N/A'] }
        }
      },
      rotors: {
        left: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Scored', 'Warped', 'Cracked', 'N/A'] },
          surfaceCondition: { type: String, enum: ['Smooth', 'Grooved', 'Heat Spots', 'N/A'] }
        },
        right: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Scored', 'Warped', 'Cracked', 'N/A'] },
          surfaceCondition: { type: String, enum: ['Smooth', 'Grooved', 'Heat Spots', 'N/A'] }
        }
      },
      calipers: {
        left: {
          condition: { type: String, enum: ['Good', 'Sticking', 'Leaking', 'N/A'] },
          pistonMovement: { type: String, enum: ['Free', 'Sticking', 'Seized', 'N/A'] }
        },
        right: {
          condition: { type: String, enum: ['Good', 'Sticking', 'Leaking', 'N/A'] },
          pistonMovement: { type: String, enum: ['Free', 'Sticking', 'Seized', 'N/A'] }
        }
      },
      hoses: {
        left: { type: String, enum: ['Good', 'Cracked', 'Swollen', 'Leaking', 'N/A'] },
        right: { type: String, enum: ['Good', 'Cracked', 'Swollen', 'Leaking', 'N/A'] }
      }
    },
    rearBrakes: {
      type: { type: String, enum: ['Disc', 'Drum', 'N/A'] },
      pads: {
        left: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Worn', 'Needs Replacement', 'N/A'] },
          wearPattern: { type: String, enum: ['Even', 'Uneven', 'N/A'] }
        },
        right: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Worn', 'Needs Replacement', 'N/A'] },
          wearPattern: { type: String, enum: ['Even', 'Uneven', 'N/A'] }
        }
      },
      rotorsOrDrums: {
        left: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Scored', 'Out of Round', 'Cracked', 'N/A'] }
        },
        right: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Scored', 'Out of Round', 'Cracked', 'N/A'] }
        }
      },
      calipersOrCylinders: {
        left: {
          condition: { type: String, enum: ['Good', 'Sticking', 'Leaking', 'N/A'] }
        },
        right: {
          condition: { type: String, enum: ['Good', 'Sticking', 'Leaking', 'N/A'] }
        }
      },
      shoes: {
        left: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Worn', 'Contaminated', 'N/A'] }
        },
        right: {
          thickness: Number,
          condition: { type: String, enum: ['Good', 'Worn', 'Contaminated', 'N/A'] }
        }
      },
      hoses: {
        left: { type: String, enum: ['Good', 'Cracked', 'Swollen', 'Leaking', 'N/A'] },
        right: { type: String, enum: ['Good', 'Cracked', 'Swollen', 'Leaking', 'N/A'] }
      }
    },
    parkingBrake: {
      type: { type: String, enum: ['Cable', 'Electronic', 'N/A'] },
      operation: { type: String, enum: ['Holds Well', 'Weak', 'Not Working', 'N/A'] },
      adjustment: { type: String, enum: ['Correct', 'Loose', 'Tight', 'N/A'] },
      cables: { type: String, enum: ['Good', 'Stretched', 'Frayed', 'Seized', 'N/A'] }
    },
    abs: {
      present: { type: Boolean, default: false },
      warningLight: { type: String, enum: ['Off', 'On', 'Intermittent', 'N/A'] },
      operation: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      sensors: {
        frontLeft: { type: String, enum: ['Good', 'Faulty', 'N/A'] },
        frontRight: { type: String, enum: ['Good', 'Faulty', 'N/A'] },
        rearLeft: { type: String, enum: ['Good', 'Faulty', 'N/A'] },
        rearRight: { type: String, enum: ['Good', 'Faulty', 'N/A'] }
      }
    },
    notes: String,
    images: [String]
  },

  // Wheels & Tires (20+ checkpoints)
  wheelsAndTires: {
    tires: {
      brand: String,
      model: String,
      size: String,
      type: { type: String, enum: ['Summer', 'All-Season', 'Winter', 'Performance', 'Off-Road'] },
      manufactureDate: {
        frontLeft: String,
        frontRight: String,
        rearLeft: String,
        rearRight: String,
        spare: String
      },
      treadDepth: {
        frontLeft: {
          inner: Number,
          center: Number,
          outer: Number,
          minimum: Number
        },
        frontRight: {
          inner: Number,
          center: Number,
          outer: Number,
          minimum: Number
        },
        rearLeft: {
          inner: Number,
          center: Number,
          outer: Number,
          minimum: Number
        },
        rearRight: {
          inner: Number,
          center: Number,
          outer: Number,
          minimum: Number
        },
        spare: Number
      },
      condition: {
        frontLeft: {
          sidewall: { type: String, enum: ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A'] },
          tread: { type: String, enum: ['Good', 'Worn', 'Uneven', 'Damaged', 'N/A'] },
          pressure: Number,
          notes: String
        },
        frontRight: {
          sidewall: { type: String, enum: ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A'] },
          tread: { type: String, enum: ['Good', 'Worn', 'Uneven', 'Damaged', 'N/A'] },
          pressure: Number,
          notes: String
        },
        rearLeft: {
          sidewall: { type: String, enum: ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A'] },
          tread: { type: String, enum: ['Good', 'Worn', 'Uneven', 'Damaged', 'N/A'] },
          pressure: Number,
          notes: String
        },
        rearRight: {
          sidewall: { type: String, enum: ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A'] },
          tread: { type: String, enum: ['Good', 'Worn', 'Uneven', 'Damaged', 'N/A'] },
          pressure: Number,
          notes: String
        },
        spare: {
          type: { type: String, enum: ['Full Size', 'Temporary', 'Run-Flat', 'Missing', 'N/A'] },
          condition: { type: String, enum: ['Good', 'Old', 'Damaged', 'N/A'] },
          pressure: Number
        }
      },
      wearPattern: {
        frontLeft: { type: String, enum: ['Even', 'Inner', 'Outer', 'Center', 'Edges', 'Cupping', 'N/A'] },
        frontRight: { type: String, enum: ['Even', 'Inner', 'Outer', 'Center', 'Edges', 'Cupping', 'N/A'] },
        rearLeft: { type: String, enum: ['Even', 'Inner', 'Outer', 'Center', 'Edges', 'Cupping', 'N/A'] },
        rearRight: { type: String, enum: ['Even', 'Inner', 'Outer', 'Center', 'Edges', 'Cupping', 'N/A'] }
      }
    },
    wheels: {
      type: { type: String, enum: ['Steel', 'Alloy', 'Chrome', 'Forged', 'Carbon Fiber'] },
      size: String,
      condition: {
        frontLeft: {
          rim: { type: String, enum: ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A'] },
          finish: { type: String, enum: ['Good', 'Peeling', 'Corroded', 'N/A'] },
          balance: { type: String, enum: ['Good', 'Needs Balancing', 'N/A'] }
        },
        frontRight: {
          rim: { type: String, enum: ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A'] },
          finish: { type: String, enum: ['Good', 'Peeling', 'Corroded', 'N/A'] },
          balance: { type: String, enum: ['Good', 'Needs Balancing', 'N/A'] }
        },
        rearLeft: {
          rim: { type: String, enum: ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A'] },
          finish: { type: String, enum: ['Good', 'Peeling', 'Corroded', 'N/A'] },
          balance: { type: String, enum: ['Good', 'Needs Balancing', 'N/A'] }
        },
        rearRight: {
          rim: { type: String, enum: ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A'] },
          finish: { type: String, enum: ['Good', 'Peeling', 'Corroded', 'N/A'] },
          balance: { type: String, enum: ['Good', 'Needs Balancing', 'N/A'] }
        }
      },
      lugNuts: {
        condition: { type: String, enum: ['Good', 'Rusted', 'Stripped', 'Missing', 'N/A'] },
        torque: { type: String, enum: ['Correct', 'Loose', 'Over-tightened', 'N/A'] },
        lockNut: { type: Boolean, default: false }
      },
      hubcaps: {
        present: { type: Boolean, default: false },
        condition: { type: String, enum: ['Good', 'Damaged', 'Missing', 'N/A'] }
      },
      tpms: {
        present: { type: Boolean, default: false },
        warningLight: { type: String, enum: ['Off', 'On', 'N/A'] },
        sensors: {
          frontLeft: { type: String, enum: ['Working', 'Faulty', 'N/A'] },
          frontRight: { type: String, enum: ['Working', 'Faulty', 'N/A'] },
          rearLeft: { type: String, enum: ['Working', 'Faulty', 'N/A'] },
          rearRight: { type: String, enum: ['Working', 'Faulty', 'N/A'] }
        }
      }
    },
    notes: String,
    images: [String]
  },

  // Electrical System (20+ checkpoints)
  electrical: {
    battery: {
      type: { type: String, enum: ['Lead Acid', 'AGM', 'Gel', 'Lithium', 'N/A'] },
      brand: String,
      age: Number,
      voltage: Number,
      coldCrankingAmps: Number,
      loadTest: { type: String, enum: ['Passed', 'Failed', 'Marginal', 'N/A'] },
      terminals: {
        condition: { type: String, enum: ['Clean', 'Corroded', 'Loose', 'N/A'] },
        cables: { type: String, enum: ['Good', 'Corroded', 'Frayed', 'N/A'] }
      },
      holdDown: { type: String, enum: ['Secure', 'Loose', 'Missing', 'N/A'] },
      fluidLevel: { type: String, enum: ['Good', 'Low', 'N/A'] }
    },
    alternator: {
      chargingVoltage: Number,
      chargingRate: { type: String, enum: ['Good', 'Low', 'Overcharging', 'Not Charging', 'N/A'] },
      belt: { type: String, enum: ['Good', 'Worn', 'Loose', 'N/A'] },
      noise: { type: String, enum: ['None', 'Whining', 'Grinding', 'N/A'] }
    },
    starter: {
      operation: { type: String, enum: ['Good', 'Slow', 'Intermittent', 'Not Working', 'N/A'] },
      noise: { type: String, enum: ['Normal', 'Grinding', 'Clicking', 'N/A'] },
      engagement: { type: String, enum: ['Quick', 'Delayed', 'Multiple Attempts', 'N/A'] }
    },
    wiring: {
      engineBay: { type: String, enum: ['Good', 'Damaged', 'Modified', 'N/A'] },
      underDash: { type: String, enum: ['Good', 'Damaged', 'Modified', 'N/A'] },
      grounds: { type: String, enum: ['Clean', 'Corroded', 'Loose', 'N/A'] }
    },
    fuses: {
      condition: { type: String, enum: ['All Good', 'Some Blown', 'N/A'] },
      boxCondition: { type: String, enum: ['Good', 'Damaged', 'Corroded', 'N/A'] }
    },
    relays: {
      condition: { type: String, enum: ['All Working', 'Some Failed', 'N/A'] }
    },
    notes: String,
    images: [String]
  },

  // Road Test (15+ checkpoints)
  roadTest: {
    performed: { type: Boolean, default: false },
    testConditions: {
      weather: { type: String, enum: ['Clear', 'Rain', 'Snow', 'Fog', 'N/A'] },
      roadType: { type: String, enum: ['City', 'Highway', 'Mixed', 'N/A'] },
      traffic: { type: String, enum: ['Light', 'Moderate', 'Heavy', 'N/A'] },
      duration: Number,
      distance: Number
    },
    enginePerformance: {
      startUp: { type: String, enum: ['Immediate', 'Delayed', 'Difficult', 'N/A'] },
      idle: { type: String, enum: ['Smooth', 'Rough', 'Hunting', 'N/A'] },
      acceleration: { type: String, enum: ['Good', 'Hesitant', 'Poor', 'N/A'] },
      cruising: { type: String, enum: ['Smooth', 'Surging', 'Misfire', 'N/A'] },
      deceleration: { type: String, enum: ['Smooth', 'Rough', 'Backfire', 'N/A'] },
      engineBraking: { type: String, enum: ['Good', 'Weak', 'N/A'] }
    },
    transmissionPerformance: {
      shifting: { type: String, enum: ['Smooth', 'Hard', 'Slipping', 'N/A'] },
      downshifting: { type: String, enum: ['Smooth', 'Hard', 'Delayed', 'N/A'] },
      kickdown: { type: String, enum: ['Responsive', 'Delayed', 'Not Working', 'N/A'] },
      noiseOnDrive: { type: String, enum: ['None', 'Whining', 'Clunking', 'N/A'] }
    },
    brakingPerformance: {
      normalBraking: { type: String, enum: ['Good', 'Soft', 'Hard', 'N/A'] },
      hardBraking: { type: String, enum: ['Straight', 'Pulls Left', 'Pulls Right', 'N/A'] },
      absActivation: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      parkingBrakeHold: { type: String, enum: ['Holds Well', 'Slips', 'Not Working', 'N/A'] }
    },
    handlingAndSteering: {
      straightLineStability: { type: String, enum: ['Good', 'Wanders', 'Pulls', 'N/A'] },
      corneringStability: { type: String, enum: ['Good', 'Body Roll', 'Unstable', 'N/A'] },
      steeringFeel: { type: String, enum: ['Good', 'Heavy', 'Light', 'Vague', 'N/A'] },
      steeringReturn: { type: String, enum: ['Good', 'Slow', 'Doesn\'t Return', 'N/A'] },
      turningRadius: { type: String, enum: ['Good', 'Wide', 'N/A'] }
    },
    suspensionPerformance: {
      rideQuality: { type: String, enum: ['Smooth', 'Firm', 'Harsh', 'Bouncy', 'N/A'] },
      bumpAbsorption: { type: String, enum: ['Good', 'Poor', 'Bottoming Out', 'N/A'] },
      noiseOverBumps: { type: String, enum: ['None', 'Clunking', 'Squeaking', 'N/A'] },
      bodyControl: { type: String, enum: ['Good', 'Excessive Movement', 'N/A'] }
    },
    noiseVibrationHarshness: {
      engineNoise: { type: String, enum: ['Normal', 'Loud', 'Unusual', 'N/A'] },
      windNoise: { type: String, enum: ['Minimal', 'Moderate', 'Excessive', 'N/A'] },
      roadNoise: { type: String, enum: ['Minimal', 'Moderate', 'Excessive', 'N/A'] },
      vibrations: {
        idle: { type: String, enum: ['None', 'Mild', 'Severe', 'N/A'] },
        acceleration: { type: String, enum: ['None', 'Mild', 'Severe', 'N/A'] },
        cruising: { type: String, enum: ['None', 'Mild', 'Severe', 'N/A'] },
        braking: { type: String, enum: ['None', 'Mild', 'Severe', 'N/A'] }
      },
      unusualNoises: [{
        type: String,
        location: String,
        condition: String
      }]
    },
    cruiseControl: {
      engagement: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      maintaining: { type: String, enum: ['Good', 'Hunting', 'Drops Out', 'N/A'] },
      disengagement: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
    },
    notes: String
  },

  // Additional Features & Accessories
  additionalFeatures: {
    safety: {
      airbags: {
        driver: { type: String, enum: ['Present', 'Deployed', 'Missing', 'N/A'] },
        passenger: { type: String, enum: ['Present', 'Deployed', 'Missing', 'N/A'] },
        sideCurtain: { type: String, enum: ['Present', 'Deployed', 'Missing', 'N/A'] },
        sideImpact: { type: String, enum: ['Present', 'Deployed', 'Missing', 'N/A'] },
        knee: { type: String, enum: ['Present', 'Deployed', 'Missing', 'N/A'] },
        warningLight: { type: String, enum: ['Off', 'On', 'N/A'] }
      },
      tractionControl: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      stabilityControl: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      blindSpotMonitoring: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      laneKeepAssist: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      collisionWarning: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      emergencyBraking: { type: String, enum: ['Working', 'Not Working', 'N/A'] },
      adaptiveCruiseControl: { type: String, enum: ['Working', 'Not Working', 'N/A'] }
    },
    accessories: {
      towBar: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      roofRack: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      runningBoards: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      mudFlaps: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      bedLiner: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      tonneauCover: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      winch: { type: String, enum: ['Present', 'Not Present', 'N/A'] },
      lightBar: { type: String, enum: ['Present', 'Not Present', 'N/A'] }
    },
    modifications: [{
      type: String,
      description: String,
      quality: { type: String, enum: ['Professional', 'Amateur', 'Poor'] }
    }]
  },

  // Overall Assessment
  overallAssessment: {
    recommendation: {
      type: String,
      enum: ['Highly Recommended', 'Recommended', 'Recommended with Repairs', 'Not Recommended'],
      required: true
    },
    estimatedRepairCost: {
      currency: { type: String, default: 'PKR' },
      amount: Number
    },
    majorIssues: [{
      category: String,
      issue: String,
      severity: { type: String, enum: ['Minor', 'Moderate', 'Major', 'Critical'] },
      repairUrgency: { type: String, enum: ['Immediate', 'Soon', 'Monitor', 'Preventive'] },
      estimatedCost: Number
    }],
    strengths: [String],
    weaknesses: [String],
    inspectorNotes: String,
    disclaimers: [String]
  },

  // Car Parts Details (linked to separate collection)
  carParts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarPart'
  }],
  
  // Metadata
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  inspectionLocation: {
    address: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  inspectionDuration: {
    type: Number,
    default: 0
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date
}, {
  timestamps: true
});

// Generate shareable link on save
inspectionReportSchema.pre('save', async function(next) {
  // Generate unique report number if not exists
  if (!this.reportNumber) {
    let isUnique = false;
    let reportNumber;
    
    while (!isUnique) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000);
      reportNumber = `INS-${year}-${random.toString().padStart(5, '0')}`;
      
      // Check if this report number already exists
      const existing = await this.constructor.findOne({ reportNumber });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.reportNumber = reportNumber;
  }
  
  // Generate shareable link if not exists
  if (!this.shareableLink) {
    this.shareableLink = crypto.randomBytes(32).toString('hex');
  }
  
  // Calculate inspection summary
  let passed = 0, failed = 0, warning = 0, notApplicable = 0;
  
  // Count checkpoints based on conditions
  const countCondition = (condition) => {
    if (!condition || condition === 'N/A') {
      notApplicable++;
    } else if (condition === 'Good' || condition === 'Excellent' || condition === 'Working') {
      passed++;
    } else if (condition === 'Fair' || condition === 'Worn') {
      warning++;
    } else {
      failed++;
    }
  };
  
  // Iterate through all sections and count conditions
  // This is a simplified version - you'd need to recursively check all nested objects
  
  this.inspectionSummary = {
    totalCheckpoints: 200,
    passedCheckpoints: passed,
    failedCheckpoints: failed,
    warningCheckpoints: warning,
    notApplicableCheckpoints: notApplicable
  };
  
  next();
});

// Calculate overall rating based on inspection data
inspectionReportSchema.methods.calculateOverallRating = function() {
  // If overallRating is already set, don't recalculate
  if (this.overallRating && this.overallRating > 0) {
    return;
  }
  
  const weights = {
    engine: 0.25,
    transmission: 0.15,
    brakes: 0.15,
    suspension: 0.10,
    exterior: 0.10,
    interior: 0.10,
    electrical: 0.05,
    wheelsAndTires: 0.05,
    roadTest: 0.05
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  // Calculate section scores (simplified)
  // In production, you'd have more sophisticated scoring logic
  // For now, just use the manually set overallRating or default to 5
  
  if (totalWeight === 0) {
    // If no sections are scored, use the manually provided rating or default
    this.overallRating = this.overallRating || 5;
  } else {
    this.overallRating = Math.round(totalScore / totalWeight * 10) / 10;
  }
  
  // Set condition based on rating
  if (this.overallRating >= 9) {
    this.overallCondition = this.overallCondition || 'Excellent';
  } else if (this.overallRating >= 8) {
    this.overallCondition = this.overallCondition || 'Very Good';
  } else if (this.overallRating >= 7) {
    this.overallCondition = this.overallCondition || 'Good';
  } else if (this.overallRating >= 5) {
    this.overallCondition = this.overallCondition || 'Fair';
  } else {
    this.overallCondition = this.overallCondition || 'Poor';
  }
};

inspectionReportSchema.index({ shareableLink: 1 });
inspectionReportSchema.index({ reportNumber: 1 });
inspectionReportSchema.index({ car: 1, inspectionDate: -1 });
inspectionReportSchema.index({ inspector: 1, createdAt: -1 });

module.exports = mongoose.model('InspectionReport', inspectionReportSchema);