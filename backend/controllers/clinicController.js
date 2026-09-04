const Clinic = require('../models/Clinic');
const QueueToken = require('../models/QueueToken');

// The live queue estimate. This is what makes the demo work:
// booking a token immediately pushes up the wait time shown on the Clinics page.
async function withLiveQueue(clinics) {
  const ids = clinics.map((c) => c._id);

  const counts = await QueueToken.aggregate([
    { $match: { clinicId: { $in: ids }, status: 'booked' } },
    { $group: { _id: '$clinicId', booked: { $sum: 1 } } },
  ]);

  const bookedByClinic = new Map(counts.map((c) => [String(c._id), c.booked]));

  return clinics.map((c) => {
    const booked = bookedByClinic.get(String(c._id)) || 0;
    const queueLength = c.walkInQueue + booked;
    return {
      ...c.toObject(),
      bookedTokens: booked,
      queueLength,
      estimatedWaitMins: queueLength * c.avgMinsPerPatient,
    };
  });
}

// GET /api/clinics?area=Kandy&type=OPD&q=base
exports.listClinics = async (req, res, next) => {
  try {
    const { area, district, type, q } = req.query;
    const filter = {};

    if (area) filter.area = new RegExp(`^${area}$`, 'i');
    if (district) filter.district = new RegExp(`^${district}$`, 'i');
    if (type) filter.type = type;
    if (q) filter.name = new RegExp(q, 'i');

    const clinics = await Clinic.find(filter).sort({ name: 1 });
    res.json(await withLiveQueue(clinics));
  } catch (err) {
    next(err);
  }
};

// GET /api/clinics/:id
exports.getClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    const [withQueue] = await withLiveQueue([clinic]);
    res.json(withQueue);
  } catch (err) {
    next(err);
  }
};
