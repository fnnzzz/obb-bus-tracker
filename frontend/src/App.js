import { ArrowPathIcon, ClockIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo, useState } from "react";

const fromHomeRoutes = [
  { name: "🚍 Kaiser → Liesing", value: "kaiser-liesing" },
  { name: "🚉 Rodaun → Hietzing", value: "rodaun_tram-hietzing" },
  { name: "🚆 Liesing Bhf → Hauptbahnhof", value: "liesing_bhf-hauptbahnhof" },
  {
    name: "🚆 Pdorf Bhf → Hauptbahnhof",
    value: "perchtoldsdorf_bhf-hauptbahnhof",
  },
  { name: "🚍 Rodaun → Liesing", value: "rodaun_bus-liesing" },
  { name: "🚍 Rodaun → Spitalskirche", value: "rodaun_bus-spitalskirche" },
];

const toHomeRoutes = [
  { name: "🚍 Liesing → Rodaun", value: "liesing-rodaun_bus" },
  { name: "🚉 Westbahnhof → Rodaun", value: "westbahnhof-rodaun_tram" },
  { name: "🚆 Hauptbahnhof → Liesing Bhf", value: "hauptbahnhof-liesing_bhf" },
  { name: "🚆 Prater Bhf → Liesing Bhf", value: "prater_bhf-liesing_bhf" },
  { name: "🚉 Hietzing → Rodaun", value: "hietzing-rodaun_tram" },
  { name: "🚍 Liesing → Spitalskirche", value: "liesing-spitalskirche" },
];

const mainTabs = [
  { name: "From Home", key: "from-home", routes: fromHomeRoutes },
  { name: "To Home", key: "to-home", routes: toHomeRoutes },
];

const colorMap = {
  "60A": "bg-rose-500",
  60: "bg-red-500",
  5: "bg-red-500",
  253: "bg-emerald-500",
  255: "bg-orange-500",
  256: "bg-teal-500",
  259: "bg-green-500",
  S1: "bg-indigo-700",
  S2: "bg-indigo-700",
  S3: "bg-indigo-700",
  S4: "bg-indigo-700",
  REX1: "bg-amber-500",
  REX2: "bg-amber-500",
  REX3: "bg-amber-500",
  DEFAULT: "bg-cyan-500",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Add helper function to remove text in brackets
function removeTextInBrackets(text) {
  return text.replace(/\([^()]*\)/g, "").trim();
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Home coordinates
const HOME_COORDINATES = {
  lat: 48.1322819,
  lon: 16.2630222,
};

// Distance threshold in kilometers
const DISTANCE_THRESHOLD_KM = 3;

export default function ScheduleList() {
  const [refresh] = useState("");
  const [activeTab, setActiveTab] = useState(() => "from-home");
  const [allRouteData, setAllRouteData] = useState({});
  const [routeCounts, setRouteCounts] = useState({});
  const [locationDetected, setLocationDetected] = useState(false);

  const currentRoutes = useMemo(
    () => mainTabs.find((tab) => tab.key === activeTab)?.routes || [],
    [activeTab]
  );

  const fetchRouteData = (routeValue, count) => {
    return fetch(
      `https://hlokjrpqnkak7sdugd2qajqnvu0nbnas.lambda-url.eu-central-1.on.aws/?route=${routeValue}&count=${count}`
      // `http://localhost:3000/?route=${routeValue}&count=${count}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAllRouteData((prev) => ({
          ...prev,
          [routeValue]: data,
        }));
      })
      .catch(() => {
        setAllRouteData((prev) => ({
          ...prev,
          [routeValue]: [],
        }));
      });
  };

  const handleLoadMore = (routeValue) => {
    setRouteCounts((prev) => {
      const newCounts = {
        ...prev,
        [routeValue]: 10,
      };

      // Fetch data with new count
      fetchRouteData(routeValue, 10);

      return newCounts;
    });
  };

  const handleRefreshRoute = (routeValue) => {
    // Remove the route data to show loading state
    setAllRouteData((prev) => {
      const newData = { ...prev };
      delete newData[routeValue];
      return newData;
    });

    // Fetch fresh data for this specific route
    const count = routeCounts[routeValue] || 5;
    fetchRouteData(routeValue, count);
  };

  useEffect(() => {
    // Geolocation detection for auto tab selection
    if (!locationDetected && navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distanceFromHome = calculateDistance(
            HOME_COORDINATES.lat,
            HOME_COORDINATES.lon,
            latitude,
            longitude
          );

          // Auto-set tab based on distance from home
          if (distanceFromHome > DISTANCE_THRESHOLD_KM) {
            setActiveTab("to-home");
          }
          // else keep default "from-home"

          setLocationDetected(true);
        },
        (error) => {
          // On geolocation error, keep default "from-home" tab
          console.log("Geolocation permission denied or error:", error.message);
          setLocationDetected(true);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes cache
        }
      );
    } else if (!locationDetected) {
      // Geolocation not supported, keep default "from-home"
      setLocationDetected(true);
    }
  }, [locationDetected]);

  useEffect(() => {
    // Clear previous data when tab changes
    setAllRouteData({});
  }, [activeTab, refresh]);

  useEffect(() => {
    // Fetch data for current routes
    currentRoutes.forEach((route) => {
      const count = routeCounts[route.value] || 5;
      fetchRouteData(route.value, count);
    });
  }, [currentRoutes, routeCounts]);

  return (
    <div className="my-0 mx-auto p-3" style={{ maxWidth: 400 }}>
      {/* Tab Navigation */}
      <div className="mb-4">
        <nav
          aria-label="Tabs"
          className="flex space-x-2 bg-gray-800 rounded-lg p-1"
        >
          {mainTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
              className={classNames(
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-700",
                "rounded-md px-6 py-2.5 text-sm font-medium transition-all duration-200 flex-1 text-center"
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Refresh Button */}
      {/* <div className="flex justify-end mb-4">
        <ArrowPathIcon
          onClick={() => forceRefresh(Date.now())}
          className="h-6 w-6 cursor-pointer text-gray-500"
        />
      </div> */}

      {/* Route Sections */}
      {currentRoutes.map((routeItem) => {
        const routeData = allRouteData[routeItem.value] || [];
        const isLoading = !allRouteData.hasOwnProperty(routeItem.value);
        const currentCount = routeCounts[routeItem.value] || 5;
        const canLoadMore = currentCount === 5 && routeData.length >= 5;

        return (
          <div key={routeItem.value} className="mb-8">
            {/* Route Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white py-2 bg-transparent">
                {routeItem.name}
              </h3>
              <ArrowPathIcon
                onClick={() => handleRefreshRoute(routeItem.value)}
                className="h-6 w-6 cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
              />
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 38 38"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#eee"
                >
                  <g fill="none" fillRule="evenodd">
                    <g transform="translate(1 1)" strokeWidth="2">
                      <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                      <path d="M36 18c0-9.94-8.06-18-18-18">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 18 18"
                          to="360 18 18"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </g>
                  </g>
                </svg>
              </div>
            )}

            {/* Route Data */}
            {!isLoading && (
              <>
                <dl className="grid grid-cols-1 gap-3">
                  {routeData.map((item) => {
                    const transportName = item.pr
                      .replace("Bus", "")
                      .replace("Tram", "")
                      .trim()
                      .replace(/\s+/g, ""); // Remove all whitespaces
                    const transportColorClassName =
                      colorMap[transportName] ?? colorMap["DEFAULT"];

                    const _lastStop = removeTextInBrackets(
                      item?.lastStop.replace("Wien ", "")
                    );
                    const lastStopName =
                      _lastStop.length > 20
                        ? _lastStop.slice(0, 20) + "…"
                        : _lastStop;

                    return (
                      <div
                        key={item.id}
                        className="relative overflow-hidden rounded-lg bg-white px-4 py-2 shadow"
                      >
                        <div className="flex justify-between items-center">
                          <dt
                            className={classNames(
                              "w-[70px] rounded font-bold p-3 text-center text-white text-lg whitespace-nowrap",
                              transportColorClassName
                            )}
                          >
                            {transportName}
                          </dt>
                          <dd className="text-right">
                            <span className="text-2xl font-semibold text-gray-800">
                              {item.diff < 0
                                ? `${Math.abs(item.diff)} min`
                                : "Soon"}
                            </span>
                            <p>
                              <span className="text-xl font-medium text-gray-700">
                                {item.rt?.dlt && (
                                  <span className="line-through pr-2 text-gray-400">
                                    {item.ti}
                                  </span>
                                )}
                                <span>
                                  {item.rt?.dlt ? item.rt?.dlt : item.ti}
                                </span>
                              </span>

                              {item.rt?.dlm ? (
                                <span className="text-red-600 flex justify-end items-baseline text-sm text-right font-semibold">
                                  <ClockIcon
                                    className="mr-1 h-5 w-5 flex-shrink-0 self-center text-red-500"
                                    aria-hidden="true"
                                  />
                                  {item.rt?.dlm + " min delay"}
                                </span>
                              ) : null}

                              {item?.status === "Ausfall" ? (
                                <span className="text-red-600 flex justify-end items-baseline text-sm text-right font-semibold">
                                  Canceled
                                </span>
                              ) : null}
                              {item?.lastStop && (
                                <span className="block text-sm text-gray-600">
                                  → at {item.ati} {lastStopName}
                                </span>
                              )}
                            </p>
                          </dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>

                {/* Load More Button */}
                {canLoadMore && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleLoadMore(routeItem.value)}
                      className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500 shadow-sm"
                    >
                      More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
