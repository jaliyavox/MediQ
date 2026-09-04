const QueueToken = require('../models/QueueToken');
const Clinic = require('../models/Clinic');

// POST /api/tokens  (validated by middleware/validateInput.js before it gets here)
exports.bookToken = async (req, res, next) => {
  try {
    const { patientName, contactNumber, nic, clinicId, slotTime } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) return res.status(404).json({ message: 'That clinic no longer exists.' });

    // Token numbers restart per clinic per slot, the way a real OPD counter works.
    const issued = await QueueToken.countDocuments({ clinicId, slotTime });

    const token = await QueueToken.create({
      patientName: patientName.trim(),
      contactNumber: contactNumber.trim(),
      nic: nic.trim().toUpperCase(),
      clinicId,
      slotTime,
      tokenNumber: issued + 1,
    });

    const ahead = clinic.walkInQueue + issued;

    res.status(201).json({
      token,
      clinicName: clinic.name,
      peopleAhead: ahead,
      estimatedWaitMins: ahead * clinic.avgMinsPerPatient,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tokens?clinicId=...  - used to show bookings and for the demo
exports.listTokens = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.clinicId) filter.clinicId = req.query.clinicId;

    const tokens = await QueueToken.find(filter)
      .populate('clinicId', 'name area')
      .sort({ createdAt: -1 });

    res.json(tokens);
  } catch (err) {
    next(err);
  }
};
