import { EmailTemplate } from "../components/EmailTemplate";

export const createEmlTemplate = (emailData: EmailTemplate["data"]) => {
  const boundary =
    "_000_DB8PR04MB7067676CABDF096D279E25B2AF542DB8PR04MB7067eurp_";
  const {
    from = "",
    to = "",
    cc = "",
    bcc = "",
    subject = "",
    body = "",
    readReceipt = "",
    deliveryReceipt = "",
  } = emailData;

  return `X-Unsent: 1
From: ${from}
To: ${to}
Cc: ${cc}
Bcc: ${bcc}
Subject: ${subject}
${readReceipt ? `Disposition-Notification-To: ${readReceipt}` : ""}
${deliveryReceipt ? `Return-Receipt-To: ${deliveryReceipt}` : ""}
Thread-Topic: ${subject}
Content-Language: en-US
Content-Type: multipart/alternative;
\tboundary="${boundary}"
MIME-Version: 1.0

--${boundary}
Content-Type: text/plain; charset="iso-8859-1"
Content-Transfer-Encoding: quoted-printable

${body}

--${boundary}
Content-Type: text/html; charset="iso-8859-1"
Content-Transfer-Encoding: quoted-printable

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
</head>
<body dir="ltr">
<div>${body}</div>
</body>
</html>

--${boundary}--`;
};
