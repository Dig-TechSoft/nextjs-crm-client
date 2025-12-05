declare module "nodemailer" {
  interface TransportOptions {
    service?: string;
    auth?: { user?: string; pass?: string };
  }

  interface SendMailOptions {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
  }

  interface Transporter {
    sendMail(options: SendMailOptions): Promise<void>;
  }

  function createTransport(options: TransportOptions): Transporter;

  export { createTransport };
  const _default: { createTransport: typeof createTransport };
  export default _default;
}
