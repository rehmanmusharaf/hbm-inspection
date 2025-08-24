import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import 'react-tabs/style/react-tabs.css';
import {
  CameraIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateInspectionPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      overallRating: 5,
      overallCondition: 'Good',
      exterior: {},
      interior: {},
      engine: {},
      transmission: {},
      suspension: {},
      brakes: {},
      wheelsAndTires: {},
      electrical: {},
      roadTest: {},
      additionalFeatures: {},
      overallAssessment: {
        recommendation: 'Recommended',
        majorIssues: [],
        strengths: [],
        weaknesses: []
      }
    }
  });

  const [activeTab, setActiveTab] = useState(0);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cars`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCars(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch cars');
    }
  };

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      category: 'general'
    }));
    setPreviewImages([...previewImages, ...newImages]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const uploadImages = async () => {
    const uploadPromises = previewImages.map(async (image) => {
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('category', image.category);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/upload/inspection`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data.url;
      } catch (error) {
        console.error('Image upload failed:', error);
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    return urls.filter(url => url !== null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Prepare the inspection data
      const inspectionData = {
        ...data,
        carImages: imageUrls.map((url, index) => ({
          url,
          category: previewImages[index]?.category || 'general',
          isPrimary: index === 0
        }))
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/inspections`, inspectionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Inspection report created successfully!');
      navigate(`/inspections/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create inspection report');
    } finally {
      setLoading(false);
    }
  };

  const tabTitles = [
    'Basic Info',
    'Exterior',
    'Interior',
    'Engine',
    'Transmission',
    'Suspension & Steering',
    'Brakes',
    'Wheels & Tires',
    'Electrical',
    'Road Test',
    'Assessment',
    'Images'
  ];

  const renderCheckbox = (name, label, options = ['Good', 'Fair', 'Poor', 'N/A']) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        {...register(name)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  const renderSection = (title, fields) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900">Create Comprehensive Inspection Report</h1>
          <p className="text-gray-600 mt-2">Complete all 200+ checkpoints for a thorough vehicle inspection</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs selectedIndex={activeTab} onSelect={setActiveTab}>
            <TabList className="flex flex-wrap border-b px-6">
              {tabTitles.map((title, index) => (
                <Tab key={index} className="px-4 py-2 cursor-pointer hover:bg-gray-100 focus:outline-none">
                  {title}
                </Tab>
              ))}
            </TabList>

            {/* Basic Information Tab */}
            <TabPanel>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
                    <select
                      {...register('car', { required: 'Vehicle is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a vehicle</option>
                      {cars.map(car => (
                        <option key={car._id} value={car._id}>
                          {car.make} {car.model} ({car.year}) - {car.registrationNo}
                        </option>
                      ))}
                    </select>
                    {errors.car && <p className="text-red-500 text-sm mt-1">{errors.car.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Date</label>
                    <input
                      type="date"
                      {...register('inspectionDate')}
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      {...register('overallRating', { required: 'Rating is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Condition</label>
                    <select
                      {...register('overallCondition', { required: 'Condition is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Location</label>
                    <input
                      type="text"
                      {...register('inspectionLocation.address')}
                      placeholder="Enter inspection address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Exterior Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Body Panels', [
                  renderCheckbox('exterior.body.frontBumper.condition', 'Front Bumper'),
                  renderCheckbox('exterior.body.rearBumper.condition', 'Rear Bumper'),
                  renderCheckbox('exterior.body.hood.condition', 'Hood'),
                  renderCheckbox('exterior.body.hood.alignment', 'Hood Alignment', ['Aligned', 'Misaligned', 'N/A']),
                  renderCheckbox('exterior.body.trunk.condition', 'Trunk'),
                  renderCheckbox('exterior.body.trunk.lock', 'Trunk Lock', ['Working', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.body.roof.condition', 'Roof'),
                  renderCheckbox('exterior.body.roof.sunroof', 'Sunroof', ['Working', 'Not Working', 'N/A'])
                ])}

                {renderSection('Doors', [
                  renderCheckbox('exterior.body.doors.frontLeft.condition', 'Front Left Door'),
                  renderCheckbox('exterior.body.doors.frontRight.condition', 'Front Right Door'),
                  renderCheckbox('exterior.body.doors.rearLeft.condition', 'Rear Left Door'),
                  renderCheckbox('exterior.body.doors.rearRight.condition', 'Rear Right Door'),
                  renderCheckbox('exterior.body.doors.frontLeft.alignment', 'Front Left Alignment', ['Aligned', 'Misaligned', 'N/A']),
                  renderCheckbox('exterior.body.doors.frontRight.alignment', 'Front Right Alignment', ['Aligned', 'Misaligned', 'N/A'])
                ])}

                {renderSection('Paint & Finish', [
                  renderCheckbox('exterior.paint.overallCondition', 'Paint Condition', ['Original', 'Partial Repaint', 'Full Repaint', 'Poor']),
                  renderCheckbox('exterior.paint.clearCoatCondition', 'Clear Coat'),
                  <div key="paint-meter" className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paint Meter Readings (microns)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input {...register('exterior.paint.paintMeterReadings.hood')} type="number" placeholder="Hood" className="px-2 py-1 border rounded" />
                      <input {...register('exterior.paint.paintMeterReadings.roof')} type="number" placeholder="Roof" className="px-2 py-1 border rounded" />
                      <input {...register('exterior.paint.paintMeterReadings.trunk')} type="number" placeholder="Trunk" className="px-2 py-1 border rounded" />
                      <input {...register('exterior.paint.paintMeterReadings.frontBumper')} type="number" placeholder="Front Bumper" className="px-2 py-1 border rounded" />
                    </div>
                  </div>
                ])}

                {renderSection('Glass & Mirrors', [
                  renderCheckbox('exterior.glass.windshield.condition', 'Windshield', ['Good', 'Cracked', 'Chipped', 'Replaced', 'N/A']),
                  renderCheckbox('exterior.glass.rearWindow.condition', 'Rear Window', ['Good', 'Cracked', 'Chipped', 'Replaced', 'N/A']),
                  renderCheckbox('exterior.glass.windshield.wipers', 'Windshield Wipers'),
                  renderCheckbox('exterior.glass.mirrors.leftSide.condition', 'Left Mirror', ['Good', 'Cracked', 'Broken', 'N/A']),
                  renderCheckbox('exterior.glass.mirrors.rightSide.condition', 'Right Mirror', ['Good', 'Cracked', 'Broken', 'N/A'])
                ])}

                {renderSection('Lights', [
                  renderCheckbox('exterior.lights.headlights.condition', 'Headlights Condition', ['Clear', 'Foggy', 'Yellowed', 'Cracked', 'N/A']),
                  renderCheckbox('exterior.lights.headlights.leftLow', 'Left Low Beam', ['Working', 'Dim', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.headlights.rightLow', 'Right Low Beam', ['Working', 'Dim', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.taillights.left', 'Left Taillight', ['Working', 'Dim', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.taillights.right', 'Right Taillight', ['Working', 'Dim', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.brakeLights.left', 'Left Brake Light', ['Working', 'Dim', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.brakeLights.right', 'Right Brake Light', ['Working', 'Dim', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.turnSignals.frontLeft', 'Front Left Turn Signal', ['Working', 'Fast', 'Slow', 'Not Working', 'N/A']),
                  renderCheckbox('exterior.lights.turnSignals.frontRight', 'Front Right Turn Signal', ['Working', 'Fast', 'Slow', 'Not Working', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Interior Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Seats', [
                  renderCheckbox('interior.seats.driverSeat.condition', 'Driver Seat', ['Excellent', 'Good', 'Fair', 'Poor', 'N/A']),
                  renderCheckbox('interior.seats.passengerSeat.condition', 'Passenger Seat', ['Excellent', 'Good', 'Fair', 'Poor', 'N/A']),
                  renderCheckbox('interior.seats.rearSeats.condition', 'Rear Seats', ['Excellent', 'Good', 'Fair', 'Poor', 'N/A']),
                  renderCheckbox('interior.seats.driverSeat.adjustment.power', 'Driver Power Adjustment', ['Working', 'Partial', 'Not Working', 'N/A']),
                  renderCheckbox('interior.seats.driverSeat.adjustment.heating', 'Driver Seat Heating', ['Working', 'Not Working', 'N/A']),
                  renderCheckbox('interior.seats.seatBelts.driverSide', 'Driver Seatbelt', ['Working', 'Slow Retraction', 'Not Working', 'N/A'])
                ])}

                {renderSection('Dashboard & Controls', [
                  renderCheckbox('interior.dashboard.condition', 'Dashboard Condition', ['Excellent', 'Good', 'Fair', 'Poor', 'N/A']),
                  renderCheckbox('interior.dashboard.instrumentCluster.speedometer', 'Speedometer', ['Working', 'Intermittent', 'Not Working', 'N/A']),
                  renderCheckbox('interior.dashboard.instrumentCluster.fuelGauge', 'Fuel Gauge', ['Working', 'Intermittent', 'Not Working', 'N/A']),
                  renderCheckbox('interior.dashboard.instrumentCluster.temperatureGauge', 'Temperature Gauge', ['Working', 'Intermittent', 'Not Working', 'N/A']),
                  renderCheckbox('interior.steeringAndControls.steeringWheel.condition', 'Steering Wheel', ['Good', 'Worn', 'Damaged', 'N/A']),
                  renderCheckbox('interior.steeringAndControls.horn', 'Horn', ['Working', 'Weak', 'Not Working', 'N/A'])
                ])}

                {renderSection('HVAC System', [
                  renderCheckbox('interior.hvac.airConditioning.cooling', 'AC Cooling', ['Excellent', 'Good', 'Weak', 'Not Working', 'N/A']),
                  renderCheckbox('interior.hvac.airConditioning.heating', 'Heating', ['Excellent', 'Good', 'Weak', 'Not Working', 'N/A']),
                  renderCheckbox('interior.hvac.airConditioning.fanSpeeds', 'Fan Speeds', ['All Working', 'Some Not Working', 'None Working', 'N/A']),
                  renderCheckbox('interior.hvac.airConditioning.defrost', 'Defrost', ['Working', 'Slow', 'Not Working', 'N/A'])
                ])}

                {renderSection('Electronics', [
                  renderCheckbox('interior.electricalAndElectronics.infotainmentSystem.display', 'Display', ['Working', 'Intermittent', 'Dead Pixels', 'Not Working', 'N/A']),
                  renderCheckbox('interior.electricalAndElectronics.infotainmentSystem.touchscreen', 'Touchscreen', ['Responsive', 'Slow', 'Unresponsive', 'N/A']),
                  renderCheckbox('interior.electricalAndElectronics.infotainmentSystem.bluetooth', 'Bluetooth', ['Working', 'Connection Issues', 'Not Working', 'N/A']),
                  renderCheckbox('interior.electricalAndElectronics.infotainmentSystem.backupCamera', 'Backup Camera', ['Clear', 'Blurry', 'Intermittent', 'Not Working', 'N/A']),
                  renderCheckbox('interior.electricalAndElectronics.infotainmentSystem.parkingSensors', 'Parking Sensors', ['Working', 'Partial', 'Not Working', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Engine Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Engine General', [
                  renderCheckbox('engine.general.startUp.coldStart', 'Cold Start', ['Easy', 'Delayed', 'Difficult', 'N/A']),
                  renderCheckbox('engine.general.startUp.idleQuality', 'Idle Quality', ['Smooth', 'Rough', 'Hunting', 'N/A']),
                  renderCheckbox('engine.general.startUp.engineNoise', 'Engine Noise', ['Normal', 'Ticking', 'Knocking', 'Squealing', 'N/A']),
                  renderCheckbox('engine.general.engineBay.cleanliness', 'Engine Bay', ['Clean', 'Dusty', 'Oil Stains', 'Very Dirty', 'N/A'])
                ])}

                {renderSection('Fluids', [
                  renderCheckbox('engine.oilSystem.engineOil.level', 'Engine Oil Level', ['Full', 'Adequate', 'Low', 'Empty', 'N/A']),
                  renderCheckbox('engine.oilSystem.engineOil.condition', 'Oil Condition', ['Clean', 'Slightly Dirty', 'Dirty', 'Very Dirty', 'N/A']),
                  renderCheckbox('engine.oilSystem.engineOil.leaks', 'Oil Leaks', ['None', 'Minor', 'Moderate', 'Severe', 'N/A']),
                  renderCheckbox('engine.coolingSystem.coolant.level', 'Coolant Level', ['Full', 'Adequate', 'Low', 'Empty', 'N/A']),
                  renderCheckbox('engine.coolingSystem.coolant.condition', 'Coolant Condition', ['Clean', 'Slightly Dirty', 'Dirty', 'Rusty', 'N/A'])
                ])}

                {renderSection('Belts & Hoses', [
                  renderCheckbox('engine.beltsAndChains.serpentineBelt.condition', 'Serpentine Belt', ['Good', 'Glazed', 'Cracked', 'Frayed', 'N/A']),
                  renderCheckbox('engine.beltsAndChains.timingBelt.condition', 'Timing Belt', ['Good', 'Worn', 'Cracked', 'Due for Change', 'N/A']),
                  renderCheckbox('engine.coolingSystem.hoses.upperRadiator', 'Upper Radiator Hose', ['Good', 'Soft', 'Hard', 'Leaking', 'N/A']),
                  renderCheckbox('engine.coolingSystem.hoses.lowerRadiator', 'Lower Radiator Hose', ['Good', 'Soft', 'Hard', 'Leaking', 'N/A'])
                ])}

                {renderSection('Air & Fuel', [
                  renderCheckbox('engine.airIntake.airFilter.condition', 'Air Filter', ['Clean', 'Slightly Dirty', 'Dirty', 'Very Dirty', 'N/A']),
                  renderCheckbox('engine.fuelSystem.fuelType', 'Fuel Type', ['Petrol', 'Diesel', 'Hybrid', 'CNG', 'LPG', 'Electric']),
                  renderCheckbox('engine.fuelSystem.fuelTank.condition', 'Fuel Tank', ['Good', 'Minor Damage', 'Major Damage', 'Leaking', 'N/A']),
                  renderCheckbox('engine.fuelSystem.fuelLines.condition', 'Fuel Lines', ['Good', 'Cracked', 'Leaking', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Transmission Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Transmission Type & Operation', [
                  renderCheckbox('transmission.type', 'Transmission Type', ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT']),
                  renderCheckbox('transmission.general.operation', 'Operation', ['Smooth', 'Rough', 'Slipping', 'N/A']),
                  renderCheckbox('transmission.general.shiftQuality', 'Shift Quality', ['Smooth', 'Hard', 'Delayed', 'N/A']),
                  renderCheckbox('transmission.general.noise', 'Noise', ['None', 'Whining', 'Grinding', 'Clunking', 'N/A'])
                ])}

                {renderSection('Transmission Fluid', [
                  renderCheckbox('transmission.fluid.level', 'Fluid Level', ['Full', 'Adequate', 'Low', 'Empty', 'N/A']),
                  renderCheckbox('transmission.fluid.condition', 'Fluid Condition', ['Clean', 'Slightly Dirty', 'Dirty', 'Burnt', 'N/A']),
                  renderCheckbox('transmission.fluid.leaks', 'Fluid Leaks', ['None', 'Minor', 'Moderate', 'Severe', 'N/A'])
                ])}

                {renderSection('Clutch (Manual)', [
                  renderCheckbox('transmission.clutch.pedal.engagement', 'Clutch Engagement', ['Smooth', 'Grabbing', 'Slipping', 'N/A']),
                  renderCheckbox('transmission.clutch.pedal.feel', 'Pedal Feel', ['Normal', 'Heavy', 'Light', 'N/A']),
                  renderCheckbox('transmission.clutch.disc.condition', 'Clutch Disc', ['Good', 'Worn', 'Slipping', 'N/A'])
                ])}

                {renderSection('Gear Shifting', [
                  renderCheckbox('transmission.gearShifting.first', '1st Gear', ['Smooth', 'Hard', 'Grinding', 'N/A']),
                  renderCheckbox('transmission.gearShifting.second', '2nd Gear', ['Smooth', 'Hard', 'Grinding', 'N/A']),
                  renderCheckbox('transmission.gearShifting.third', '3rd Gear', ['Smooth', 'Hard', 'Grinding', 'N/A']),
                  renderCheckbox('transmission.gearShifting.reverse', 'Reverse Gear', ['Smooth', 'Hard', 'Grinding', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Suspension & Steering Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Front Suspension', [
                  renderCheckbox('suspension.frontSuspension.shockAbsorbers.left', 'Left Shock Absorber', ['Good', 'Leaking', 'Weak', 'Broken', 'N/A']),
                  renderCheckbox('suspension.frontSuspension.shockAbsorbers.right', 'Right Shock Absorber', ['Good', 'Leaking', 'Weak', 'Broken', 'N/A']),
                  renderCheckbox('suspension.frontSuspension.springs.left', 'Left Spring', ['Good', 'Sagging', 'Broken', 'N/A']),
                  renderCheckbox('suspension.frontSuspension.springs.right', 'Right Spring', ['Good', 'Sagging', 'Broken', 'N/A'])
                ])}

                {renderSection('Rear Suspension', [
                  renderCheckbox('suspension.rearSuspension.shockAbsorbers.left', 'Left Shock Absorber', ['Good', 'Leaking', 'Weak', 'Broken', 'N/A']),
                  renderCheckbox('suspension.rearSuspension.shockAbsorbers.right', 'Right Shock Absorber', ['Good', 'Leaking', 'Weak', 'Broken', 'N/A']),
                  renderCheckbox('suspension.rearSuspension.springs.left', 'Left Spring', ['Good', 'Sagging', 'Broken', 'N/A']),
                  renderCheckbox('suspension.rearSuspension.springs.right', 'Right Spring', ['Good', 'Sagging', 'Broken', 'N/A'])
                ])}

                {renderSection('Steering System', [
                  renderCheckbox('suspension.steering.type', 'Steering Type', ['Manual', 'Hydraulic Power', 'Electric Power', 'Electro-Hydraulic']),
                  renderCheckbox('suspension.steering.rack.condition', 'Steering Rack', ['Good', 'Worn', 'Leaking', 'N/A']),
                  renderCheckbox('suspension.steering.powerSteering.pump', 'Power Steering Pump', ['Working', 'Noisy', 'Leaking', 'N/A']),
                  renderCheckbox('suspension.steering.powerSteering.fluid.level', 'PS Fluid Level', ['Full', 'Low', 'Empty', 'N/A']),
                  renderCheckbox('suspension.steering.alignment.pulling', 'Steering Pull', ['None', 'Left', 'Right', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Brakes Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Brake Performance', [
                  renderCheckbox('brakes.general.pedalFeel', 'Pedal Feel', ['Firm', 'Soft', 'Spongy', 'Goes to Floor', 'N/A']),
                  renderCheckbox('brakes.general.brakingPerformance', 'Braking Performance', ['Excellent', 'Good', 'Fair', 'Poor', 'N/A']),
                  renderCheckbox('brakes.general.pulling', 'Brake Pull', ['None', 'Left', 'Right', 'N/A']),
                  renderCheckbox('brakes.general.noise', 'Brake Noise', ['None', 'Squeaking', 'Grinding', 'Squealing', 'N/A'])
                ])}

                {renderSection('Front Brakes', [
                  renderCheckbox('brakes.frontBrakes.type', 'Type', ['Disc', 'Drum', 'N/A']),
                  renderCheckbox('brakes.frontBrakes.pads.left.condition', 'Left Pad', ['Good', 'Worn', 'Needs Replacement', 'N/A']),
                  renderCheckbox('brakes.frontBrakes.pads.right.condition', 'Right Pad', ['Good', 'Worn', 'Needs Replacement', 'N/A']),
                  renderCheckbox('brakes.frontBrakes.rotors.left.condition', 'Left Rotor', ['Good', 'Scored', 'Warped', 'Cracked', 'N/A']),
                  renderCheckbox('brakes.frontBrakes.rotors.right.condition', 'Right Rotor', ['Good', 'Scored', 'Warped', 'Cracked', 'N/A'])
                ])}

                {renderSection('Rear Brakes', [
                  renderCheckbox('brakes.rearBrakes.type', 'Type', ['Disc', 'Drum', 'N/A']),
                  renderCheckbox('brakes.rearBrakes.pads.left.condition', 'Left Pad/Shoe', ['Good', 'Worn', 'Needs Replacement', 'N/A']),
                  renderCheckbox('brakes.rearBrakes.pads.right.condition', 'Right Pad/Shoe', ['Good', 'Worn', 'Needs Replacement', 'N/A']),
                  renderCheckbox('brakes.parkingBrake.operation', 'Parking Brake', ['Holds Well', 'Weak', 'Not Working', 'N/A'])
                ])}

                {renderSection('Brake System', [
                  renderCheckbox('brakes.fluid.level', 'Brake Fluid Level', ['Full', 'Adequate', 'Low', 'Empty', 'N/A']),
                  renderCheckbox('brakes.fluid.condition', 'Brake Fluid Condition', ['Clear', 'Slightly Dark', 'Dark', 'Contaminated', 'N/A']),
                  renderCheckbox('brakes.abs.present', 'ABS Present', ['Yes', 'No']),
                  renderCheckbox('brakes.abs.operation', 'ABS Operation', ['Working', 'Not Working', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Wheels & Tires Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Tire Information', [
                  <div key="tire-brand" className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tire Brand & Model</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input {...register('wheelsAndTires.tires.brand')} placeholder="Brand" className="px-3 py-2 border rounded-md" />
                      <input {...register('wheelsAndTires.tires.model')} placeholder="Model" className="px-3 py-2 border rounded-md" />
                    </div>
                  </div>,
                  renderCheckbox('wheelsAndTires.tires.type', 'Tire Type', ['Summer', 'All-Season', 'Winter', 'Performance', 'Off-Road'])
                ])}

                {renderSection('Tire Condition', [
                  renderCheckbox('wheelsAndTires.tires.condition.frontLeft.sidewall', 'FL Sidewall', ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A']),
                  renderCheckbox('wheelsAndTires.tires.condition.frontRight.sidewall', 'FR Sidewall', ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A']),
                  renderCheckbox('wheelsAndTires.tires.condition.rearLeft.sidewall', 'RL Sidewall', ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A']),
                  renderCheckbox('wheelsAndTires.tires.condition.rearRight.sidewall', 'RR Sidewall', ['Good', 'Cracked', 'Bulge', 'Damaged', 'N/A'])
                ])}

                {renderSection('Tread Depth (mm)', [
                  <div key="tread-depth" className="col-span-full">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs">Front Left</label>
                        <input {...register('wheelsAndTires.tires.treadDepth.frontLeft.center')} type="number" step="0.1" placeholder="mm" className="w-full px-2 py-1 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs">Front Right</label>
                        <input {...register('wheelsAndTires.tires.treadDepth.frontRight.center')} type="number" step="0.1" placeholder="mm" className="w-full px-2 py-1 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs">Rear Left</label>
                        <input {...register('wheelsAndTires.tires.treadDepth.rearLeft.center')} type="number" step="0.1" placeholder="mm" className="w-full px-2 py-1 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs">Rear Right</label>
                        <input {...register('wheelsAndTires.tires.treadDepth.rearRight.center')} type="number" step="0.1" placeholder="mm" className="w-full px-2 py-1 border rounded" />
                      </div>
                    </div>
                  </div>
                ])}

                {renderSection('Wheels', [
                  renderCheckbox('wheelsAndTires.wheels.type', 'Wheel Type', ['Steel', 'Alloy', 'Chrome', 'Forged', 'Carbon Fiber']),
                  renderCheckbox('wheelsAndTires.wheels.condition.frontLeft.rim', 'FL Rim', ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A']),
                  renderCheckbox('wheelsAndTires.wheels.condition.frontRight.rim', 'FR Rim', ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A']),
                  renderCheckbox('wheelsAndTires.wheels.condition.rearLeft.rim', 'RL Rim', ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A']),
                  renderCheckbox('wheelsAndTires.wheels.condition.rearRight.rim', 'RR Rim', ['Good', 'Scratched', 'Bent', 'Cracked', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Electrical Tab */}
            <TabPanel>
              <div className="p-6">
                {renderSection('Battery', [
                  renderCheckbox('electrical.battery.type', 'Battery Type', ['Lead Acid', 'AGM', 'Gel', 'Lithium', 'N/A']),
                  renderCheckbox('electrical.battery.terminals.condition', 'Terminals', ['Clean', 'Corroded', 'Loose', 'N/A']),
                  renderCheckbox('electrical.battery.holdDown', 'Hold Down', ['Secure', 'Loose', 'Missing', 'N/A']),
                  <div key="battery-voltage" className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voltage</label>
                    <input {...register('electrical.battery.voltage')} type="number" step="0.1" placeholder="V" className="w-full px-3 py-2 border rounded-md" />
                  </div>
                ])}

                {renderSection('Charging System', [
                  renderCheckbox('electrical.alternator.chargingRate', 'Alternator Charging', ['Good', 'Low', 'Overcharging', 'Not Charging', 'N/A']),
                  renderCheckbox('electrical.alternator.belt', 'Alternator Belt', ['Good', 'Worn', 'Loose', 'N/A']),
                  renderCheckbox('electrical.starter.operation', 'Starter Operation', ['Good', 'Slow', 'Intermittent', 'Not Working', 'N/A'])
                ])}

                {renderSection('Wiring & Fuses', [
                  renderCheckbox('electrical.wiring.engineBay', 'Engine Bay Wiring', ['Good', 'Damaged', 'Modified', 'N/A']),
                  renderCheckbox('electrical.fuses.condition', 'Fuses', ['All Good', 'Some Blown', 'N/A']),
                  renderCheckbox('electrical.relays.condition', 'Relays', ['All Working', 'Some Failed', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Road Test Tab */}
            <TabPanel>
              <div className="p-6">
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('roadTest.performed')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Road test performed</span>
                  </label>
                </div>

                {renderSection('Test Conditions', [
                  renderCheckbox('roadTest.testConditions.weather', 'Weather', ['Clear', 'Rain', 'Snow', 'Fog', 'N/A']),
                  renderCheckbox('roadTest.testConditions.roadType', 'Road Type', ['City', 'Highway', 'Mixed', 'N/A']),
                  renderCheckbox('roadTest.testConditions.traffic', 'Traffic', ['Light', 'Moderate', 'Heavy', 'N/A'])
                ])}

                {renderSection('Engine Performance', [
                  renderCheckbox('roadTest.enginePerformance.startUp', 'Start Up', ['Immediate', 'Delayed', 'Difficult', 'N/A']),
                  renderCheckbox('roadTest.enginePerformance.acceleration', 'Acceleration', ['Good', 'Hesitant', 'Poor', 'N/A']),
                  renderCheckbox('roadTest.enginePerformance.cruising', 'Cruising', ['Smooth', 'Surging', 'Misfire', 'N/A'])
                ])}

                {renderSection('Handling', [
                  renderCheckbox('roadTest.handlingAndSteering.straightLineStability', 'Straight Line', ['Good', 'Wanders', 'Pulls', 'N/A']),
                  renderCheckbox('roadTest.handlingAndSteering.corneringStability', 'Cornering', ['Good', 'Body Roll', 'Unstable', 'N/A']),
                  renderCheckbox('roadTest.handlingAndSteering.steeringFeel', 'Steering Feel', ['Good', 'Heavy', 'Light', 'Vague', 'N/A'])
                ])}

                {renderSection('Noise & Vibration', [
                  renderCheckbox('roadTest.noiseVibrationHarshness.engineNoise', 'Engine Noise', ['Normal', 'Loud', 'Unusual', 'N/A']),
                  renderCheckbox('roadTest.noiseVibrationHarshness.windNoise', 'Wind Noise', ['Minimal', 'Moderate', 'Excessive', 'N/A']),
                  renderCheckbox('roadTest.noiseVibrationHarshness.vibrations.idle', 'Vibration at Idle', ['None', 'Mild', 'Severe', 'N/A'])
                ])}
              </div>
            </TabPanel>

            {/* Overall Assessment Tab */}
            <TabPanel>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Recommendation</label>
                  <select
                    {...register('overallAssessment.recommendation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Highly Recommended">Highly Recommended</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Recommended with Repairs">Recommended with Repairs</option>
                    <option value="Not Recommended">Not Recommended</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Market Value (PKR)</label>
                    <input
                      type="number"
                      {...register('overallAssessment.estimatedMarketValue.amount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Repair Cost (PKR)</label>
                    <input
                      type="number"
                      {...register('overallAssessment.estimatedRepairCost.amount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                  <textarea
                    {...register('overallAssessment.strengths')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="List vehicle strengths (comma separated)"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weaknesses</label>
                  <textarea
                    {...register('overallAssessment.weaknesses')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="List vehicle weaknesses (comma separated)"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Notes</label>
                  <textarea
                    {...register('overallAssessment.inspectorNotes')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="5"
                    placeholder="Additional notes and observations"
                  />
                </div>
              </div>
            </TabPanel>

            {/* Images Tab */}
            <TabPanel>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Upload Vehicle Images</h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {isDragActive ? (
                      <p className="text-blue-600">Drop the images here...</p>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-2">Drag & drop images here, or click to select</p>
                        <p className="text-sm text-gray-500">Supported formats: JPEG, PNG, WebP</p>
                      </div>
                    )}
                  </div>
                </div>

                {previewImages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Uploaded Images ({previewImages.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <select
                              value={image.category}
                              onChange={(e) => {
                                const updated = [...previewImages];
                                updated[index].category = e.target.value;
                                setPreviewImages(updated);
                              }}
                              className="text-xs px-2 py-1 bg-white rounded shadow"
                            >
                              <option value="front">Front</option>
                              <option value="rear">Rear</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                              <option value="interior-front">Interior Front</option>
                              <option value="interior-rear">Interior Rear</option>
                              <option value="dashboard">Dashboard</option>
                              <option value="engine">Engine</option>
                              <option value="trunk">Trunk</option>
                              <option value="wheels">Wheels</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = previewImages.filter((_, i) => i !== index);
                              setPreviewImages(updated);
                            }}
                            className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>
          </Tabs>

          {/* Submit Buttons */}
          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/inspections')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <div className="space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Report'}
              </button>
              <button
                type="button"
                onClick={handleSubmit(async (data) => {
                  data.isPublished = true;
                  await onSubmit(data);
                })}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Create & Publish'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInspectionPage;