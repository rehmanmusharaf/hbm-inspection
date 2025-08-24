const PDFDocument = require('pdfkit');

exports.generateInspectionPDF = async (report) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        compress: true,
        info: {
          Title: `Inspection Report - ${report.reportNumber}`,
          Author: 'HBM Car Inspection System',
          Subject: 'Vehicle Inspection Report'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Helper functions
      const getValue = (value) => {
        if (value === null || value === undefined || value === '' || value === 'N/A') return 'N/A';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return String(value);
      };

      const getColor = (condition) => {
        if (!condition || condition === 'N/A') return '#6B7280';
        const lower = condition.toLowerCase();
        if (lower.includes('good') || lower.includes('excellent') || lower === 'working' || lower === 'passed') {
          return '#059669';
        } else if (lower.includes('fair') || lower.includes('worn') || lower === 'warning') {
          return '#D97706';
        } else if (lower.includes('poor') || lower === 'not working' || lower === 'failed') {
          return '#DC2626';
        }
        return '#111827';
      };

      // PAGE 1: Header, Vehicle Info, and Overall Assessment
      // Header
      doc.rect(0, 0, doc.page.width, 60).fill('#1E40AF');
      doc.fillColor('#FFFFFF')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('HBM CAR INSPECTION REPORT', 30, 20);
      
      doc.fontSize(9)
         .font('Helvetica')
         .text(`Report #: ${report.reportNumber}`, 30, 42)
         .text(`Date: ${new Date(report.inspectionDate).toLocaleDateString()}`, 200, 42)
         .text(`Inspector: ${report.inspector?.name || 'N/A'}`, 380, 42);

      // Overall Rating Box
      doc.fillColor('#F3F4F6')
         .rect(30, 70, 250, 60)
         .fill();
      
      const ratingColor = report.overallRating >= 7 ? '#059669' : 
                         report.overallRating >= 5 ? '#D97706' : '#DC2626';
      
      doc.fillColor('#111827')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('OVERALL RATING', 40, 80);
      
      doc.fillColor(ratingColor)
         .fontSize(28)
         .text(`${report.overallRating}/10`, 40, 95);
      
      doc.fillColor('#374151')
         .fontSize(10)
         .font('Helvetica')
         .text(report.overallCondition || 'N/A', 130, 105);

      // Recommendation Box
      doc.fillColor('#F3F4F6')
         .rect(290, 70, 275, 60)
         .fill();
      
      doc.fillColor('#111827')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('RECOMMENDATION', 300, 80);
      
      const recColor = report.overallAssessment?.recommendation === 'Highly Recommended' ? '#059669' :
                      report.overallAssessment?.recommendation === 'Recommended' ? '#0891B2' :
                      report.overallAssessment?.recommendation === 'Recommended with Repairs' ? '#D97706' :
                      '#DC2626';
      
      doc.fillColor(recColor)
         .fontSize(12)
         .text(report.overallAssessment?.recommendation || 'Pending', 300, 100);

      // Inspection Summary Stats
      if (report.inspectionSummary) {
        const sum = report.inspectionSummary;
        doc.fillColor('#374151')
           .fontSize(8)
           .font('Helvetica')
           .text(`Checkpoints: ${sum.totalCheckpoints || 200}`, 300, 115)
           .fillColor('#059669')
           .text(`Pass: ${sum.passedCheckpoints || 0}`, 380, 115)
           .fillColor('#D97706')
           .text(`Warn: ${sum.warningCheckpoints || 0}`, 430, 115)
           .fillColor('#DC2626')
           .text(`Fail: ${sum.failedCheckpoints || 0}`, 480, 115);
      }

      // Vehicle Information Section
      doc.fillColor('#1E40AF')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('VEHICLE INFORMATION', 30, 145);
      
      doc.strokeColor('#E5E7EB')
         .moveTo(30, 160)
         .lineTo(565, 160)
         .stroke();

      const car = report.car || {};
      let yPos = 170;
      
      // Vehicle details in two columns
      doc.fillColor('#374151')
         .fontSize(8)
         .font('Helvetica');
      
      const leftCol = [
        ['Make/Model', `${getValue(car.make)} ${getValue(car.model)}`],
        ['Year', getValue(car.year)],
        ['Registration', getValue(car.registrationNo)],
        ['Mileage', car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A']
      ];
      
      const rightCol = [
        ['VIN/Chassis', getValue(car.chassisNo)],
        ['Engine No', getValue(car.engineNo)],
        ['Fuel/Trans', `${getValue(car.fuelType)}/${getValue(car.transmissionType)}`],
        ['Color', getValue(car.color)]
      ];

      leftCol.forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(`${key}:`, 30, yPos, { continued: true, width: 80 });
        doc.font('Helvetica').text(` ${value}`, { width: 200 });
        yPos += 12;
      });

      yPos = 170;
      rightCol.forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(`${key}:`, 300, yPos, { continued: true, width: 80 });
        doc.font('Helvetica').text(` ${value}`, { width: 200 });
        yPos += 12;
      });

      // INSPECTION DETAILS TABLE
      yPos = 230;
      doc.fillColor('#1E40AF')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('INSPECTION DETAILS', 30, yPos);
      
      yPos += 15;
      
      // Table Headers
      doc.fillColor('#F3F4F6')
         .rect(30, yPos, 535, 18)
         .fill();
      
      doc.fillColor('#111827')
         .fontSize(8)
         .font('Helvetica-Bold')
         .text('Category', 35, yPos + 5)
         .text('Component', 120, yPos + 5)
         .text('Condition', 280, yPos + 5)
         .text('Issues/Notes', 380, yPos + 5);
      
      yPos += 20;
      doc.fontSize(7).font('Helvetica');

      // Function to add a table row
      const addRow = (category, component, condition, notes) => {
        if (yPos > 780) {
          doc.addPage();
          yPos = 40;
          
          // Repeat table header on new page
          doc.fillColor('#F3F4F6')
             .rect(30, yPos, 535, 18)
             .fill();
          
          doc.fillColor('#111827')
             .fontSize(8)
             .font('Helvetica-Bold')
             .text('Category', 35, yPos + 5)
             .text('Component', 120, yPos + 5)
             .text('Condition', 280, yPos + 5)
             .text('Issues/Notes', 380, yPos + 5);
          
          yPos += 20;
          doc.fontSize(7).font('Helvetica');
        }
        
        // Alternate row background
        if (Math.floor(yPos / 14) % 2 === 0) {
          doc.fillColor('#FAFAFA').rect(30, yPos - 2, 535, 14).fill();
        }
        
        doc.fillColor('#374151')
           .text(category, 35, yPos, { width: 80 })
           .text(component, 120, yPos, { width: 155 });
        
        doc.fillColor(getColor(condition))
           .text(getValue(condition), 280, yPos, { width: 95 });
        
        doc.fillColor('#6B7280')
           .text(notes || '', 380, yPos, { width: 180 });
        
        yPos += 14;
      };

      // EXTERIOR
      if (report.exterior) {
        const ext = report.exterior;
        
        // Body
        if (ext.body) {
          addRow('Exterior', 'Front Bumper', ext.body.frontBumper?.condition, ext.body.frontBumper?.issues?.join(', '));
          addRow('Exterior', 'Rear Bumper', ext.body.rearBumper?.condition, ext.body.rearBumper?.issues?.join(', '));
          addRow('Exterior', 'Hood', ext.body.hood?.condition, ext.body.hood?.alignment);
          addRow('Exterior', 'Roof', ext.body.roof?.condition, ext.body.roof?.sunroof);
          addRow('Exterior', 'Trunk', ext.body.trunk?.condition, ext.body.trunk?.alignment);
          
          // Doors
          if (ext.body.doors) {
            addRow('Exterior', 'Front Left Door', ext.body.doors.frontLeft?.condition, ext.body.doors.frontLeft?.lock);
            addRow('Exterior', 'Front Right Door', ext.body.doors.frontRight?.condition, ext.body.doors.frontRight?.lock);
            addRow('Exterior', 'Rear Doors', 
              `L: ${getValue(ext.body.doors.rearLeft?.condition)}, R: ${getValue(ext.body.doors.rearRight?.condition)}`, '');
          }
        }
        
        // Paint
        if (ext.paint) {
          addRow('Exterior', 'Paint Overall', ext.paint.overallCondition, 
            `Color Match: ${ext.paint.colorMatch ? 'Yes' : 'No'}`);
          if (ext.paint.scratchesAndDents?.length) {
            addRow('Exterior', 'Scratches/Dents', 'Present', 
              `${ext.paint.scratchesAndDents.length} locations`);
          }
        }
        
        // Glass
        if (ext.glass) {
          addRow('Exterior', 'Windshield', ext.glass.windshield?.condition, 
            `Wipers: ${getValue(ext.glass.windshield?.wipers)}`);
          addRow('Exterior', 'Rear Window', ext.glass.rearWindow?.condition, 
            `Defogger: ${getValue(ext.glass.rearWindow?.defogger)}`);
        }
        
        // Lights
        if (ext.lights) {
          addRow('Exterior', 'Headlights', ext.lights.headlights?.condition,
            `L: ${getValue(ext.lights.headlights?.leftLow)}, R: ${getValue(ext.lights.headlights?.rightLow)}`);
          addRow('Exterior', 'Taillights', 
            `L: ${getValue(ext.lights.taillights?.left)}, R: ${getValue(ext.lights.taillights?.right)}`, '');
          addRow('Exterior', 'Turn Signals', 'Various',
            `FL: ${getValue(ext.lights.turnSignals?.frontLeft)}, FR: ${getValue(ext.lights.turnSignals?.frontRight)}`);
        }
      }

      // INTERIOR
      if (report.interior) {
        const int = report.interior;
        
        // Seats
        if (int.seats) {
          addRow('Interior', 'Driver Seat', int.seats.driverSeat?.condition,
            `${getValue(int.seats.driverSeat?.material)}, Tears: ${int.seats.driverSeat?.tears ? 'Yes' : 'No'}`);
          addRow('Interior', 'Passenger Seat', int.seats.passengerSeat?.condition,
            `Stains: ${int.seats.passengerSeat?.stains ? 'Yes' : 'No'}`);
          addRow('Interior', 'Rear Seats', int.seats.rearSeats?.condition, '');
          
          // Seat Belts
          if (int.seats.seatBelts) {
            addRow('Interior', 'Seat Belts', 'Various',
              `Driver: ${getValue(int.seats.seatBelts.driverSide)}, Pass: ${getValue(int.seats.seatBelts.passengerSide)}`);
          }
        }
        
        // Dashboard
        if (int.dashboard) {
          addRow('Interior', 'Dashboard', int.dashboard.condition,
            `Cracks: ${int.dashboard.cracks ? 'Yes' : 'No'}`);
          if (int.dashboard.instrumentCluster) {
            addRow('Interior', 'Gauges', 'Various',
              `Speed: ${getValue(int.dashboard.instrumentCluster.speedometer)}, Fuel: ${getValue(int.dashboard.instrumentCluster.fuelGauge)}`);
          }
        }
        
        // HVAC
        if (int.hvac?.airConditioning) {
          addRow('Interior', 'AC/Heating', int.hvac.airConditioning.cooling,
            `Heat: ${getValue(int.hvac.airConditioning.heating)}, Fans: ${getValue(int.hvac.airConditioning.fanSpeeds)}`);
        }
        
        // Electronics
        if (int.electricalAndElectronics?.infotainmentSystem) {
          const info = int.electricalAndElectronics.infotainmentSystem;
          addRow('Interior', 'Infotainment', info.display,
            `Touch: ${getValue(info.touchscreen)}, BT: ${getValue(info.bluetooth)}`);
          addRow('Interior', 'Camera/Sensors', info.backupCamera,
            `Parking: ${getValue(info.parkingSensors)}`);
        }
      }

      // ENGINE
      if (report.engine) {
        const eng = report.engine;
        
        // General
        if (eng.general?.startUp) {
          addRow('Engine', 'Start/Idle', eng.general.startUp.coldStart,
            `Idle: ${getValue(eng.general.startUp.idleQuality)}, Noise: ${getValue(eng.general.startUp.engineNoise)}`);
        }
        
        // Oil
        if (eng.oilSystem?.engineOil) {
          addRow('Engine', 'Engine Oil', eng.oilSystem.engineOil.level,
            `Condition: ${getValue(eng.oilSystem.engineOil.condition)}, Leaks: ${getValue(eng.oilSystem.engineOil.leaks)}`);
        }
        
        // Cooling
        if (eng.coolingSystem?.coolant) {
          addRow('Engine', 'Coolant', eng.coolingSystem.coolant.level,
            `Condition: ${getValue(eng.coolingSystem.coolant.condition)}, Leaks: ${getValue(eng.coolingSystem.coolant.leaks)}`);
        }
        
        // Belts
        if (eng.beltsAndChains) {
          addRow('Engine', 'Timing Belt', eng.beltsAndChains.timingBelt?.condition || 'N/A', '');
          addRow('Engine', 'Serpentine Belt', eng.beltsAndChains.serpentineBelt?.condition || 'N/A', '');
        }
        
        // Air Intake
        if (eng.airIntake) {
          addRow('Engine', 'Air Filter', eng.airIntake.airFilter?.condition || 'N/A', '');
          if (eng.airIntake.turbocharger && eng.airIntake.turbocharger.condition !== 'N/A') {
            addRow('Engine', 'Turbocharger', eng.airIntake.turbocharger.condition, 
              `Boost: ${getValue(eng.airIntake.turbocharger.boost)}`);
          }
        }
      }

      // TRANSMISSION
      if (report.transmission) {
        const trans = report.transmission;
        addRow('Transmission', 'Type', trans.type || 'N/A', '');
        
        if (trans.general) {
          addRow('Transmission', 'Operation', trans.general.operation,
            `Shift: ${getValue(trans.general.shiftQuality)}, Noise: ${getValue(trans.general.noise)}`);
        }
        
        if (trans.fluid) {
          addRow('Transmission', 'Fluid', trans.fluid.level,
            `Condition: ${getValue(trans.fluid.condition)}, Leaks: ${getValue(trans.fluid.leaks)}`);
        }
        
        if (trans.clutch?.pedal) {
          addRow('Transmission', 'Clutch', trans.clutch.pedal.engagement,
            `Feel: ${getValue(trans.clutch.pedal.feel)}`);
        }
      }

      // BRAKES
      if (report.brakes) {
        const brk = report.brakes;
        
        if (brk.general) {
          addRow('Brakes', 'Pedal Feel', brk.general.pedalFeel,
            `Performance: ${getValue(brk.general.brakingPerformance)}`);
          addRow('Brakes', 'Issues', brk.general.noise,
            `Pulling: ${getValue(brk.general.pulling)}, Vibration: ${getValue(brk.general.vibration)}`);
        }
        
        if (brk.fluid) {
          addRow('Brakes', 'Brake Fluid', brk.fluid.level,
            `Condition: ${getValue(brk.fluid.condition)}, Leaks: ${getValue(brk.fluid.leaks)}`);
        }
        
        // Front Brakes
        if (brk.frontBrakes) {
          const front = brk.frontBrakes;
          if (front.pads) {
            addRow('Brakes', 'Front Pads', 
              `L: ${getValue(front.pads.left?.condition)}, R: ${getValue(front.pads.right?.condition)}`,
              `${front.pads.left?.thickness || 'N/A'}mm / ${front.pads.right?.thickness || 'N/A'}mm`);
          }
          if (front.rotors) {
            addRow('Brakes', 'Front Rotors',
              `L: ${getValue(front.rotors.left?.condition)}, R: ${getValue(front.rotors.right?.condition)}`, '');
          }
        }
        
        // Rear Brakes
        if (brk.rearBrakes?.pads) {
          addRow('Brakes', 'Rear Pads/Shoes',
            `L: ${getValue(brk.rearBrakes.pads.left?.condition)}, R: ${getValue(brk.rearBrakes.pads.right?.condition)}`, '');
        }
        
        // Parking & ABS
        if (brk.parkingBrake) {
          addRow('Brakes', 'Parking Brake', brk.parkingBrake.operation, '');
        }
        if (brk.abs?.present) {
          addRow('Brakes', 'ABS', brk.abs.operation,
            `Warning Light: ${getValue(brk.abs.warningLight)}`);
        }
      }

      // SUSPENSION & STEERING
      if (report.suspension) {
        const sus = report.suspension;
        
        // Front Suspension
        if (sus.frontSuspension) {
          if (sus.frontSuspension.shockAbsorbers) {
            addRow('Suspension', 'Front Shocks',
              `L: ${getValue(sus.frontSuspension.shockAbsorbers.left)}, R: ${getValue(sus.frontSuspension.shockAbsorbers.right)}`, '');
          }
          if (sus.frontSuspension.springs) {
            addRow('Suspension', 'Front Springs',
              `L: ${getValue(sus.frontSuspension.springs.left)}, R: ${getValue(sus.frontSuspension.springs.right)}`, '');
          }
        }
        
        // Rear Suspension
        if (sus.rearSuspension?.shockAbsorbers) {
          addRow('Suspension', 'Rear Shocks',
            `L: ${getValue(sus.rearSuspension.shockAbsorbers.left)}, R: ${getValue(sus.rearSuspension.shockAbsorbers.right)}`, '');
        }
        
        // Steering
        if (sus.steering) {
          addRow('Steering', 'Type', sus.steering.type || 'N/A', '');
          if (sus.steering.powerSteering) {
            addRow('Steering', 'Power Steering', sus.steering.powerSteering.pump,
              `Fluid: ${getValue(sus.steering.powerSteering.fluid?.level)}`);
          }
          if (sus.steering.alignment) {
            addRow('Steering', 'Alignment', sus.steering.alignment.pulling,
              `Tire Wear: ${getValue(sus.steering.alignment.tirewearPattern)}`);
          }
        }
      }

      // WHEELS & TIRES
      if (report.wheelsAndTires) {
        const wt = report.wheelsAndTires;
        
        if (wt.tires) {
          addRow('Tires', 'Brand/Model', `${getValue(wt.tires.brand)} ${getValue(wt.tires.model)}`,
            `Size: ${getValue(wt.tires.size)}, Type: ${getValue(wt.tires.type)}`);
          
          // Tread Depth
          if (wt.tires.treadDepth) {
            const td = wt.tires.treadDepth;
            if (td.frontLeft) {
              const avgFL = ((td.frontLeft.inner || 0) + (td.frontLeft.center || 0) + (td.frontLeft.outer || 0)) / 3;
              const avgFR = td.frontRight ? ((td.frontRight.inner || 0) + (td.frontRight.center || 0) + (td.frontRight.outer || 0)) / 3 : 0;
              addRow('Tires', 'Front Tread', avgFL >= 3 ? 'Good' : avgFL >= 2 ? 'Fair' : 'Poor',
                `FL: ${avgFL.toFixed(1)}mm, FR: ${avgFR.toFixed(1)}mm`);
            }
            if (td.rearLeft) {
              const avgRL = ((td.rearLeft.inner || 0) + (td.rearLeft.center || 0) + (td.rearLeft.outer || 0)) / 3;
              const avgRR = td.rearRight ? ((td.rearRight.inner || 0) + (td.rearRight.center || 0) + (td.rearRight.outer || 0)) / 3 : 0;
              addRow('Tires', 'Rear Tread', avgRL >= 3 ? 'Good' : avgRL >= 2 ? 'Fair' : 'Poor',
                `RL: ${avgRL.toFixed(1)}mm, RR: ${avgRR.toFixed(1)}mm`);
            }
          }
        }
        
        if (wt.wheels) {
          addRow('Wheels', 'Type/Size', `${getValue(wt.wheels.type)} ${getValue(wt.wheels.size)}`, '');
        }
      }

      // ELECTRICAL
      if (report.electrical) {
        const elec = report.electrical;
        
        if (elec.battery) {
          addRow('Electrical', 'Battery', elec.battery.loadTest || 'N/A',
            `${getValue(elec.battery.voltage)}V, ${getValue(elec.battery.type)}`);
        }
        
        if (elec.alternator) {
          addRow('Electrical', 'Alternator', elec.alternator.chargingRate,
            `${getValue(elec.alternator.chargingVoltage)}V`);
        }
        
        if (elec.starter) {
          addRow('Electrical', 'Starter', elec.starter.operation,
            `Noise: ${getValue(elec.starter.noise)}`);
        }
      }

      // ROAD TEST
      if (report.roadTest?.performed) {
        const rt = report.roadTest;
        
        if (rt.enginePerformance) {
          addRow('Road Test', 'Engine', rt.enginePerformance.acceleration || 'N/A',
            `Idle: ${getValue(rt.enginePerformance.idle)}, Cruise: ${getValue(rt.enginePerformance.cruising)}`);
        }
        
        if (rt.transmissionPerformance) {
          addRow('Road Test', 'Transmission', rt.transmissionPerformance.shifting || 'N/A',
            `Noise: ${getValue(rt.transmissionPerformance.noiseOnDrive)}`);
        }
        
        if (rt.handlingAndSteering) {
          addRow('Road Test', 'Handling', rt.handlingAndSteering.straightLineStability || 'N/A',
            `Cornering: ${getValue(rt.handlingAndSteering.corneringStability)}`);
        }
        
        if (rt.noiseVibrationHarshness) {
          addRow('Road Test', 'NVH', rt.noiseVibrationHarshness.engineNoise || 'N/A',
            `Wind: ${getValue(rt.noiseVibrationHarshness.windNoise)}, Road: ${getValue(rt.noiseVibrationHarshness.roadNoise)}`);
        }
      }

      // MAJOR ISSUES (if they fit on current page)
      if (report.overallAssessment?.majorIssues?.length > 0 && yPos < 650) {
        yPos += 10;
        doc.fillColor('#DC2626')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('MAJOR ISSUES IDENTIFIED', 30, yPos);
        
        yPos += 12;
        doc.fontSize(7)
           .font('Helvetica')
           .fillColor('#374151');
        
        report.overallAssessment.majorIssues.slice(0, 5).forEach((issue, idx) => {
          if (yPos < 750) {
            doc.text(`${idx + 1}. ${issue.category}: ${issue.issue} (${issue.severity})`, 30, yPos, { width: 535 });
            yPos += 12;
          }
        });
      }

      // FOOTER on last page
      if (yPos < 750) {
        yPos = 760;
      } else {
        doc.addPage();
        yPos = 760;
      }

      // Footer line
      doc.strokeColor('#E5E7EB')
         .moveTo(30, yPos - 10)
         .lineTo(565, yPos - 10)
         .stroke();

      // Footer text
      doc.fillColor('#6B7280')
         .fontSize(7)
         .font('Helvetica')
         .text('This report is based on visual inspection at the time of assessment. Hidden defects may not be identified.', 30, yPos, { width: 535, align: 'center' })
         .text(`Report URL: ${process.env.FRONTEND_URL || 'https://inspection.hbm.com'}/inspection/${report.shareableLink}`, 30, yPos + 10, { width: 535, align: 'center' })
         .fillColor('#1E40AF')
         .text('© HBM Car Inspection System', 30, yPos + 20, { width: 535, align: 'center' });

      // End the PDF
      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};