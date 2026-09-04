import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Find the right doctor or pharmacy,{' '}
          <span className="text-teal-700">before you travel</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          MediQ lists doctors and pharmacies across Sri Lanka. Search by area,
          see what other patients said, and send your request without leaving home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/doctors" className="rounded-lg bg-teal-700 px-5 py-2.5 font-medium text-white hover:bg-teal-800">
            Find a doctor
          </Link>
          <Link to="/pharmacies" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
            Find a pharmacy
          </Link>
        </div>
      </section>

      {/* Requirement 2: explain the problem inside the app. */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">The problem we are solving</h2>
        <div className="mt-3 space-y-3 text-slate-600">
          <p>
            Outside Colombo, finding the right doctor often means asking around, and
            finding a medicine means travelling from pharmacy to pharmacy hoping one
            has it in stock. People take a day off work, pay for transport, and
            frequently come home with nothing.
          </p>
          <p>
            There is no single place to see which doctors practise nearby, what they
            charge, or whether a pharmacy can actually supply a prescription. The cost
            of that gap falls hardest on people who cannot easily take time off.
          </p>
          <p className="font-medium text-slate-800">
            MediQ puts doctors and pharmacies in one searchable list, and lets a
            patient send a request in under a minute, from home.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { step: '1', title: 'Search', body: 'Filter doctors by specialization and area, or pharmacies by area.' },
            { step: '2', title: 'Check', body: 'Read ratings and comments left by other patients before you decide.' },
            { step: '3', title: 'Contact', body: 'Send a consultation request or a medicine enquiry. They call you back.' },
          ].map((c) => (
            <div key={c.step} className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                {c.step}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-slate-900 p-6 text-center sm:p-8">
        <h2 className="text-xl font-semibold text-white">Are you a doctor or a pharmacy?</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-300">
          List yourself for free and receive patient requests directly in your inbox.
        </p>
        <Link to="/register" className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 font-medium text-slate-900 hover:bg-slate-100">
          List yourself
        </Link>
      </section>
    </div>
  );
}
