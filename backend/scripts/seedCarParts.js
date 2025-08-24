const mongoose = require('mongoose');
const CarPartTemplate = require('../models/CarPartTemplate.model');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedCarPartTemplates = async () => {
  try {
    // Clear existing templates
    await CarPartTemplate.deleteMany({});
    console.log('Cleared existing car part templates');

    const defaultTemplates = [
      // Exterior Parts
      { name: 'Front Bumper', category: 'exterior', subCategory: 'body', sortOrder: 1, 
        commonIssues: [{ type: 'scratch', description: 'Surface scratches' }, { type: 'dent', description: 'Impact damage' }],
        inspectionPoints: ['Check for cracks', 'Inspect paint condition', 'Verify alignment', 'Check mounting points']
      },
      { name: 'Rear Bumper', category: 'exterior', subCategory: 'body', sortOrder: 2,
        commonIssues: [{ type: 'scratch', description: 'Parking damage' }, { type: 'crack', description: 'Impact cracks' }],
        inspectionPoints: ['Check for damage', 'Inspect reflectors', 'Verify alignment', 'Check sensors if equipped']
      },
      { name: 'Hood', category: 'exterior', subCategory: 'body', sortOrder: 3,
        commonIssues: [{ type: 'dent', description: 'Hail damage' }, { type: 'rust', description: 'Edge corrosion' }],
        inspectionPoints: ['Check alignment', 'Test opening/closing', 'Inspect hinges', 'Check latch mechanism']
      },
      { name: 'Roof', category: 'exterior', subCategory: 'body', sortOrder: 4,
        inspectionPoints: ['Check for dents', 'Inspect paint', 'Check sunroof operation', 'Look for rust spots']
      },
      { name: 'Trunk/Boot', category: 'exterior', subCategory: 'body', sortOrder: 5,
        inspectionPoints: ['Test opening mechanism', 'Check alignment', 'Inspect seals', 'Verify lock operation']
      },
      { name: 'Front Left Door', category: 'exterior', subCategory: 'doors', sortOrder: 6,
        inspectionPoints: ['Check alignment', 'Test opening/closing', 'Inspect handle', 'Check window operation']
      },
      { name: 'Front Right Door', category: 'exterior', subCategory: 'doors', sortOrder: 7,
        inspectionPoints: ['Check alignment', 'Test opening/closing', 'Inspect handle', 'Check window operation']
      },
      { name: 'Rear Left Door', category: 'exterior', subCategory: 'doors', sortOrder: 8,
        inspectionPoints: ['Check alignment', 'Test opening/closing', 'Inspect handle', 'Check child safety lock']
      },
      { name: 'Rear Right Door', category: 'exterior', subCategory: 'doors', sortOrder: 9,
        inspectionPoints: ['Check alignment', 'Test opening/closing', 'Inspect handle', 'Check child safety lock']
      },
      { name: 'Left Side Mirror', category: 'exterior', subCategory: 'mirrors', sortOrder: 10,
        commonIssues: [{ type: 'crack', description: 'Glass cracked' }, { type: 'malfunction', description: 'Adjustment not working' }],
        inspectionPoints: ['Check glass condition', 'Test adjustment', 'Verify heating function', 'Check mounting']
      },
      { name: 'Right Side Mirror', category: 'exterior', subCategory: 'mirrors', sortOrder: 11,
        commonIssues: [{ type: 'crack', description: 'Glass cracked' }, { type: 'malfunction', description: 'Adjustment not working' }],
        inspectionPoints: ['Check glass condition', 'Test adjustment', 'Verify heating function', 'Check mounting']
      },
      { name: 'Windshield', category: 'exterior', subCategory: 'glass', sortOrder: 16,
        commonIssues: [{ type: 'crack', description: 'Chip or crack' }, { type: 'wear', description: 'Wiper scratches' }],
        inspectionPoints: ['Check for chips/cracks', 'Inspect wipers', 'Test washer system', 'Check tinting']
      },
      { name: 'Rear Window', category: 'exterior', subCategory: 'glass', sortOrder: 17,
        inspectionPoints: ['Check for damage', 'Test defroster', 'Inspect wiper if equipped', 'Check tinting']
      },

      // Interior Parts
      { name: 'Driver Seat', category: 'interior', subCategory: 'seats', sortOrder: 1,
        commonIssues: [{ type: 'wear', description: 'Seat cushion wear' }, { type: 'tear', description: 'Upholstery damage' }],
        inspectionPoints: ['Check upholstery condition', 'Test adjustments', 'Verify heating/cooling', 'Check lumbar support']
      },
      { name: 'Passenger Seat', category: 'interior', subCategory: 'seats', sortOrder: 2,
        inspectionPoints: ['Check upholstery condition', 'Test adjustments', 'Verify heating/cooling', 'Check airbag warning']
      },
      { name: 'Rear Left Seat', category: 'interior', subCategory: 'seats', sortOrder: 3,
        inspectionPoints: ['Check upholstery', 'Test folding mechanism', 'Check headrest', 'Verify seatbelt']
      },
      { name: 'Rear Right Seat', category: 'interior', subCategory: 'seats', sortOrder: 4,
        inspectionPoints: ['Check upholstery', 'Test folding mechanism', 'Check headrest', 'Verify seatbelt']
      },
      { name: 'Dashboard', category: 'interior', subCategory: 'dashboard', sortOrder: 5,
        commonIssues: [{ type: 'crack', description: 'Dashboard cracking' }, { type: 'wear', description: 'Surface wear' }],
        inspectionPoints: ['Check for cracks', 'Inspect gauges', 'Test warning lights', 'Check air vents']
      },
      { name: 'Steering Wheel', category: 'interior', subCategory: 'controls', sortOrder: 6,
        commonIssues: [{ type: 'wear', description: 'Grip wear' }, { type: 'malfunction', description: 'Controls not working' }],
        inspectionPoints: ['Check condition', 'Test all controls', 'Verify airbag', 'Check adjustment']
      },
      { name: 'Gear Shifter', category: 'interior', subCategory: 'controls', sortOrder: 7,
        inspectionPoints: ['Test shifting', 'Check boot condition', 'Verify position indicator', 'Check operation smoothness']
      },
      { name: 'Handbrake', category: 'interior', subCategory: 'controls', sortOrder: 8,
        inspectionPoints: ['Test operation', 'Check adjustment', 'Verify hold capability', 'Inspect handle/button']
      },

      // Engine Parts
      { name: 'Engine Block', category: 'engine', subCategory: 'core', sortOrder: 1,
        commonIssues: [{ type: 'leak', description: 'Oil leaks' }, { type: 'noise', description: 'Unusual noises' }],
        inspectionPoints: ['Check for leaks', 'Listen for noises', 'Inspect mounts', 'Check fluid levels']
      },
      { name: 'Engine Oil', category: 'engine', subCategory: 'fluids', sortOrder: 2,
        commonIssues: [{ type: 'contamination', description: 'Dirty oil' }, { type: 'leak', description: 'Oil leaks' }],
        inspectionPoints: ['Check level', 'Inspect color/consistency', 'Look for leaks', 'Verify change interval']
      },
      { name: 'Coolant System', category: 'engine', subCategory: 'cooling', sortOrder: 3,
        inspectionPoints: ['Check coolant level', 'Inspect hoses', 'Test thermostat', 'Check for leaks']
      },
      { name: 'Radiator', category: 'engine', subCategory: 'cooling', sortOrder: 4,
        commonIssues: [{ type: 'leak', description: 'Coolant leaks' }, { type: 'clog', description: 'Blocked fins' }],
        inspectionPoints: ['Check for leaks', 'Inspect fins', 'Test cap', 'Verify fan operation']
      },
      { name: 'Air Filter', category: 'engine', subCategory: 'intake', sortOrder: 5,
        commonIssues: [{ type: 'clog', description: 'Dirty filter' }],
        inspectionPoints: ['Check cleanliness', 'Inspect housing', 'Verify proper fit', 'Check replacement interval']
      },
      { name: 'Fuel System', category: 'engine', subCategory: 'fuel', sortOrder: 6,
        inspectionPoints: ['Check fuel lines', 'Inspect filter', 'Test pump operation', 'Look for leaks']
      },
      { name: 'Exhaust System', category: 'engine', subCategory: 'exhaust', sortOrder: 7,
        commonIssues: [{ type: 'rust', description: 'Corrosion' }, { type: 'leak', description: 'Exhaust leaks' }],
        inspectionPoints: ['Check for leaks', 'Inspect mounting', 'Test emissions', 'Check muffler condition']
      },

      // Transmission Parts
      { name: 'Transmission Fluid', category: 'transmission', subCategory: 'fluids', sortOrder: 1,
        commonIssues: [{ type: 'contamination', description: 'Burnt fluid' }, { type: 'leak', description: 'Fluid leaks' }],
        inspectionPoints: ['Check level', 'Inspect color/smell', 'Look for leaks', 'Test shifting quality']
      },
      { name: 'Clutch System', category: 'transmission', subCategory: 'clutch', sortOrder: 2,
        commonIssues: [{ type: 'wear', description: 'Clutch wear' }, { type: 'slip', description: 'Clutch slipping' }],
        inspectionPoints: ['Test engagement', 'Check pedal feel', 'Inspect fluid', 'Test hill starts']
      },

      // Suspension Parts
      { name: 'Front Left Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 1,
        commonIssues: [{ type: 'leak', description: 'Oil leaking' }, { type: 'wear', description: 'Worn seals' }],
        inspectionPoints: ['Check for leaks', 'Test compression', 'Inspect mounting', 'Check for damage']
      },
      { name: 'Front Right Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 2,
        inspectionPoints: ['Check for leaks', 'Test compression', 'Inspect mounting', 'Check for damage']
      },
      { name: 'Rear Left Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 3,
        inspectionPoints: ['Check for leaks', 'Test compression', 'Inspect mounting', 'Check for damage']
      },
      { name: 'Rear Right Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 4,
        inspectionPoints: ['Check for leaks', 'Test compression', 'Inspect mounting', 'Check for damage']
      },

      // Brake Parts
      { name: 'Front Brake Pads', category: 'brakes', subCategory: 'pads', sortOrder: 1,
        commonIssues: [{ type: 'wear', description: 'Worn pads' }, { type: 'noise', description: 'Squealing' }],
        inspectionPoints: ['Measure thickness', 'Check wear pattern', 'Inspect for damage', 'Test performance']
      },
      { name: 'Rear Brake Pads', category: 'brakes', subCategory: 'pads', sortOrder: 2,
        inspectionPoints: ['Measure thickness', 'Check wear pattern', 'Inspect for damage', 'Test performance']
      },
      { name: 'Front Brake Discs', category: 'brakes', subCategory: 'discs', sortOrder: 3,
        commonIssues: [{ type: 'wear', description: 'Disc wear' }, { type: 'warp', description: 'Warped discs' }],
        inspectionPoints: ['Measure thickness', 'Check for warping', 'Inspect surface', 'Test runout']
      },
      { name: 'Rear Brake Discs', category: 'brakes', subCategory: 'discs', sortOrder: 4,
        inspectionPoints: ['Measure thickness', 'Check for warping', 'Inspect surface', 'Test runout']
      },
      { name: 'Brake Fluid', category: 'brakes', subCategory: 'fluids', sortOrder: 5,
        commonIssues: [{ type: 'contamination', description: 'Moisture contamination' }],
        inspectionPoints: ['Check level', 'Test moisture content', 'Inspect color', 'Check for leaks']
      },

      // Wheels & Tires
      { name: 'Front Left Tire', category: 'wheels', subCategory: 'tires', sortOrder: 1,
        commonIssues: [{ type: 'wear', description: 'Tread wear' }, { type: 'damage', description: 'Sidewall damage' }],
        inspectionPoints: ['Measure tread depth', 'Check wear pattern', 'Inspect sidewalls', 'Verify pressure']
      },
      { name: 'Front Right Tire', category: 'wheels', subCategory: 'tires', sortOrder: 2,
        inspectionPoints: ['Measure tread depth', 'Check wear pattern', 'Inspect sidewalls', 'Verify pressure']
      },
      { name: 'Rear Left Tire', category: 'wheels', subCategory: 'tires', sortOrder: 3,
        inspectionPoints: ['Measure tread depth', 'Check wear pattern', 'Inspect sidewalls', 'Verify pressure']
      },
      { name: 'Rear Right Tire', category: 'wheels', subCategory: 'tires', sortOrder: 4,
        inspectionPoints: ['Measure tread depth', 'Check wear pattern', 'Inspect sidewalls', 'Verify pressure']
      },
      { name: 'Spare Tire', category: 'wheels', subCategory: 'tires', sortOrder: 5,
        inspectionPoints: ['Check condition', 'Verify pressure', 'Inspect age', 'Check mounting']
      },

      // Electrical Parts
      { name: 'Battery', category: 'electrical', subCategory: 'power', sortOrder: 1,
        commonIssues: [{ type: 'corrosion', description: 'Terminal corrosion' }, { type: 'weak', description: 'Low capacity' }],
        inspectionPoints: ['Test voltage', 'Check terminals', 'Inspect casing', 'Test load capacity']
      },
      { name: 'Alternator', category: 'electrical', subCategory: 'charging', sortOrder: 2,
        commonIssues: [{ type: 'noise', description: 'Bearing noise' }, { type: 'undercharge', description: 'Low output' }],
        inspectionPoints: ['Test output', 'Check belt', 'Listen for noise', 'Inspect connections']
      },
      { name: 'Starter Motor', category: 'electrical', subCategory: 'starting', sortOrder: 3,
        inspectionPoints: ['Test cranking', 'Check engagement', 'Listen for noise', 'Inspect connections']
      },

      // Safety Parts
      { name: 'Driver Airbag', category: 'safety', subCategory: 'airbags', sortOrder: 1,
        inspectionPoints: ['Check warning light', 'Inspect for damage', 'Verify recall status', 'Test warning system']
      },
      { name: 'Passenger Airbag', category: 'safety', subCategory: 'airbags', sortOrder: 2,
        inspectionPoints: ['Check warning light', 'Inspect for damage', 'Verify on/off switch', 'Test indicator']
      },
      { name: 'Seat Belts', category: 'safety', subCategory: 'restraints', sortOrder: 4,
        commonIssues: [{ type: 'wear', description: 'Frayed webbing' }, { type: 'malfunction', description: 'Retractor issues' }],
        inspectionPoints: ['Test retraction', 'Check webbing', 'Verify locking', 'Inspect buckles']
      },
      { name: 'ABS System', category: 'safety', subCategory: 'braking', sortOrder: 5,
        inspectionPoints: ['Check warning light', 'Test operation', 'Inspect sensors', 'Verify functionality']
      }
    ];

    const insertedTemplates = await CarPartTemplate.insertMany(defaultTemplates);
    console.log(`Successfully seeded ${insertedTemplates.length} car part templates`);

    // Group by category for summary
    const summary = {};
    insertedTemplates.forEach(template => {
      if (!summary[template.category]) {
        summary[template.category] = 0;
      }
      summary[template.category]++;
    });

    console.log('\nSummary by category:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} parts`);
    });

  } catch (error) {
    console.error('Error seeding car part templates:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
connectDB().then(() => {
  seedCarPartTemplates();
});