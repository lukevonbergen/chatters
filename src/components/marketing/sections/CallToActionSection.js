import React from 'react';

const CallToActionSection = ({ openDemoModal }) => {
  return (
    <section>
      <div className="bg-gray-100 text-center">
        <div className="mx-auto w-full py-32 px-6">
          <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-bold md:mb-10 md:text-5xl lg:mb-12">
            Stop Bad Reviews Before They Cost You Customers
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base text-gray-600 sm:text-lg">
            Don’t wait until angry guests leave. Catch problems early, fix them instantly, and turn 1-star moments into 5-star reviews.
          </p>
          <ul className="mx-auto mb-8 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8 md:gap-10 lg:mb-12">
            <li className="flex items-center">
              <img
                src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
                alt=""
                className="mr-2 h-8 w-8"
              />
              <p className="text-sm sm:text-base">Set up in 5 minutes</p>
            </li>
            <li className="flex items-center">
              <img
                src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
                alt=""
                className="mr-2 h-8 w-8"
              />
              <p className="text-sm sm:text-base">No staff training needed</p>
            </li>
            <li className="flex items-center">
              <img
                src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
                alt=""
                className="mr-2 h-8 w-8"
              />
              <p className="text-sm sm:text-base">Boost 5-star reviews immediately</p>
            </li>
          </ul>
          <a
            onClick={openDemoModal}
            className="mb-4 inline-block cursor-pointer items-center bg-black px-6 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            Book a Demo – See It in Action
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
