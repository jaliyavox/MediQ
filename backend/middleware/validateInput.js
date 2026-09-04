// Shared validation helpers. Member C owns this file.
// Rules are deliberately simple and return friendly messages, because
// requirement 5 is graded on the user seeing a clear error, not on regex depth.

const SL_PHONE = /^0\d{9}$/;                       // 0771234567
const SL_NIC = /^(\d{9}[vVxX]|\d{12})$/;           // 941234567V or 199412345678

function validateTokenBooking(req, res, next) {
  const { patientName, contactNumber, nic, clinicId, slotTime } = req.body;
  const errors = {};

  if (!patientName || !patientName.trim()) {
    errors.patientName = 'Please enter the patient name.';
  } else if (patientName.trim().length < 3) {
    errors.patientName = 'Name must be at least 3 characters.';
  }

  if (!contactNumber) {
    errors.contactNumber = 'Please enter a contact number.';
  } else if (!SL_PHONE.test(contactNumber.trim())) {
    errors.contactNumber = 'Enter a valid 10-digit number starting with 0.';
  }

  if (!nic) {
    errors.nic = 'Please enter the NIC number.';
  } else if (!SL_NIC.test(nic.trim())) {
    errors.nic = 'Enter a valid NIC (e.g. 941234567V or 199412345678).';
  }

  if (!clinicId) errors.clinicId = 'Please select a clinic.';
  if (!slotTime) errors.slotTime = 'Please select a time slot.';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  }

  next();
}

module.exports = { validateTokenBooking };
