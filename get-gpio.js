const mock = require('mock-require');

module.exports = getGpio;

function getGpio({fallback = true} = {}) {
  try {
    const gpio = require('rpi-gpio');
  } catch (err) {
    if (!fallback) {
      throw err;
    }

    console.warn('falling back to mocked rpi-gpio');

    mock('rpi-gpio', {
      DIR_IN: 'DIR_IN',
      EDGE_FALLING: 'EDGE_FALLING',
      EDGE_RISING: 'EDGE_RISING',
      on(event, cb) {
        console.log('gpio.on called');
      },
      setup(pin, direction, edge) {
        console.log('gpio.setup called');
      }
    });

    return require('rpi-gpio');
  }
}
