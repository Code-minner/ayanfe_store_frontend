export const STORE_CONTACT = {
  brandName: "Ayanfe Store",
  addressLines: [
    "4b Fadipe street,",
    "(by Phidel Group of Schools, Seliat branch)",
    "3rd building before Green light hotel,",
    "seliat bus stop, Egbeda, Lagos.",
  ],
  emails: [
    "ayanfettograciousbusiness@gmail.com",
    "admin@ayanfettogracious.com",
  ],
  phoneDisplay: "08020705719",
  phoneTel: "+2348020705719",
  whatsapp: "2348020705719",
} as const;

export type FaqItem = {
  question: string;
  answer: string;
};

/** FAQs carried over from the previous storefront. */
export const STORE_FAQS: FaqItem[] = [
  {
    question: "Will I receive the same product that I see in the picture?",
    answer: "Yes exactly the same.",
  },
  {
    question: "Where can I view my order receipt?",
    answer:
      "After checkout we email your order confirmation and invoice to the address you used. If you have an account, you can also open Orders in your account anytime to see status and details.",
  },
  {
    question: "How can I return an item?",
    answer:
      "We do not offer refunds or exchanges. Please check sizes and product details carefully before you order. If we sent the wrong item, contact us with your order or invoice number.",
  },
  {
    question: 'Will you restock items indicated as "out of stock?"',
    answer:
      "We restock popular items when we can. There is no fixed date. Follow us or check back on the product page, or message us and we will tell you if a restock is planned.",
  },
  {
    question: "Where can I ship my order?",
    answer:
      "We deliver across Lagos and ship nationwide in Nigeria. Local pickup is also available at our Egbeda address. Share your delivery area at checkout or contact us if you are unsure we cover your location.",
  },
];
