import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51HBuAFIG7qmR0DihkwhsaK8Xe5EcS4ZXXMFJeGR9EXharTIy0mXJoJs8jsCnNinYdS0kvTW1rYWVGn4eABv43rse00yFXxC2bR'
);

export const bookTour = async (tourID) => {
  // 1) get checkout session from API
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourID}`
    );
    console.log('abrrrrrrrrrrrrr');
    console.log(session);
    console.log(session.data.session.id);
    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
