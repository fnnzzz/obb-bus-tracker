import { ArrowPathIcon, ClockIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

const tabs = [
  { name: '📍 Kaiser → Liesing', value: 'kaiser-liesing' },
  { name: '📍 Liesing → Kaiser', value: 'liesing-kaiser' },
  { name: '📍 Liesing → Spitalskirche', value: 'liesing-spitalskirche' },
  { name: '📍 Spitalskirche → Liesing', value: 'spitalskirche-liesing' },
  { name: '📍 Kaiser → Spitalskirche', value: 'kaiser-spitalskirche' },
  { name: '📍 Rodaun → Westbahnhof 🚃', value: 'rodaun-westbahnhof' },
  { name: '📍 Westbahnhof → Rodaun 🚃', value: 'westbahnhof-rodaun' },
  { name: '📍 Lange gasse → Westbahnhof 🚃', value: 'langegasse-westbahnhof' },
  { name: '📍 Westbahnhof → Lange gasse 🚃', value: 'westbahnhof-langegasse' },
]

const colorMap = {
  '60A': 'bg-rose-500',
  '60': 'bg-red-500',
  '5': 'bg-red-500',
  '253': 'bg-emerald-500',
  '256': 'bg-teal-500',
  '259': 'bg-green-500',
  'DEFAULT': 'bg-cyan-500'
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ScheduleList() {
  const [refresh, forceRefresh] = useState('')
  const [route, setRoute] = useState(tabs[0].value)
  const [data, setData] = useState([])

  useEffect(() => {
    setData([])
    fetch(`https://c4uy5c6aenf3vttzkq3atktcsm0mlibe.lambda-url.eu-central-1.on.aws/?route=${route}`).then(r => r.json()).then(
      data => setData(data)
    ).catch();
  }, [route, refresh])

  return (
    <div className="my-0 mx-auto p-3" style={{ maxWidth: 400 }}>

      <div className="flex justify-between items-center">

        <nav className="flex space-x-2" aria-label="Tabs">
          <select
            style={{ minWidth: 270 }}
            onChange={({ target: { value } }) => setRoute(value)}
            id="location"
            name="location"
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {tabs.map((tab) => (
              <option value={tab.value}>{tab.name}</option>
            ))}
          </select>
        </nav>
        <ArrowPathIcon onClick={() => forceRefresh(Date.now())} className='h-6 w-6 cursor-pointer text-gray-500' />
      </div>

      {!data.length && <div className='pt-20 flex justify-center'>

        <svg width="68" height="68" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#eee">
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(1 1)" stroke-width="2">
              <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite" />
              </path>
            </g>
          </g>
        </svg>

      </div>}

      <dl className="mt-5 grid grid-cols-1 gap-5">
        {data.map((item) => {
          const transportName = item.pr.replace('Bus', '').replace('Tram', '').trim()
          const transportColorClassName = colorMap[transportName] ?? colorMap['DEFAULT']

          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-2 shadow"
            >
              <div className="flex justify-between items-center">
                <dt style={{ minWidth: 50 }} className={classNames('rounded font-bold p-3 w-15 text-center text-white text-lg', transportColorClassName)}>
                  {transportName}
                </dt>
                <dd className="text-right">
                  <span className="text-2xl font-semibold text-gray-900">{item.diff < 0 ? `${Math.abs(item.diff)} min` : 'Now'}</span>
                  <p>
                    <span className="text-xl font-medium text-gray-600">
                      <span>{item.rt?.dlt ? item.rt?.dlt : item.ti}</span>
                      {item.rt?.dlt && <span className='line-through pl-2'>{item.ti}</span>}
                    </span>
                    {item.rt?.dlt || item.diff > 0 ? <span className="text-red-600 flex justify-end items-baseline text-sm text-right font-semibold">
                      <ClockIcon className="mr-1 h-5 w-5 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
                      {item.rt?.dlm ?? item.diff} min delay
                    </span> : null}
                  </p>
                </dd>
              </div>
            </div>
          )
        })}
      </dl>
    </div>
  )
}