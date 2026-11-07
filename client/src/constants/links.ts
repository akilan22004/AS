export const WHATSAPP_RECIPIENT = '916385298905';
export const SHOP_MAP_URL = 'https://maps.app.goo.gl/5sfbkQ2D8jWiSaPe8?g_st=ic';

export const buildWhatsAppEnquiryUrl = (message: string): string => {
  if (!/^[1-9]\d{7,14}$/.test(WHATSAPP_RECIPIENT)) {
    throw new Error('WhatsApp recipient configuration is invalid');
  }

  const url = new URL(`https://wa.me/${WHATSAPP_RECIPIENT}`);
  url.searchParams.set('text', message);

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'wa.me' ||
    url.pathname !== `/${WHATSAPP_RECIPIENT}` ||
    url.searchParams.get('text') !== message
  ) {
    throw new Error('Generated WhatsApp enquiry link is invalid');
  }

  return url.toString();
};
