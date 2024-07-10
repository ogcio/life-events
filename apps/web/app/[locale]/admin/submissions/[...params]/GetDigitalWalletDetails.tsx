import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { postgres, routes, web, workflow } from "../../../../utils";
import { ListRow } from "../../../(public)/[event]/[...action]/shared/SummaryListRow";
import FormLayout from "../../../../components/FormLayout";
import { sendAppOnboardingEmail } from "../../../(public)/[event]/[...action]/GetDigitalWallet/ServerActions";
import ds from "design-system";
import ExclamationMark from "./components/exclamationMark";

const Icon = ds.Icon;

const INSTITUTIONAL_DOMAINS = [
  "appeal.ie",
  "broadband.gov.ie",
  "cope-foundation.ie",
  "courts.ie",
  "dast.gov.ie",
  "dcenr.gov.ie",
  "dcenr.ie",
  "dcmnr.gov.ie",
  "dcmnr.ie",
  "dcmnronline.ie",
  "defence.ie",
  "dfa.ie",
  "dfat.ie",
  "doctors.gov.ie",
  "dppireland.ie",
  "duchas.ie",
  "ecap.ie",
  "exam1.examinations.ie",
  "exam2.examinations.ie",
  "exam3.examinations.ie",
  "exam4.examinations.ie",
  "examinations.ie",
  "forumoneurope.ie",
  "fsa.ie",
  "galway.brothersofcharity.ie",
  "gesci.org",
  "gmspb.ie",
  ".gov.ie",
  "gov.ie",
  "gsi.ie",
  "hse.ie",
  "infosocomm.ie",
  "inspectorofprisons.gov.ie",
  ".irlgov.ie",
  "irlgov.ie",
  "isc.ie",
  "la.hse.ie",
  "landreg.ie",
  "landregistry.ie",
  "legalaidboard.ie",
  "limerick.brothersofcharity.ie",
  "maila.hse.ie",
  "mailb.hse.ie",
  "mailc.hse.ie",
  "maild.hse.ie",
  "maile.hse.ie",
  "mailf.hse.ie",
  "mailg.hse.ie",
  "mailh.hse.ie",
  "mailk.hse.ie",
  "mailm.hse.ie",
  "mailn.hse.ie",
  "mail.oir.ie",
  "mailp.hse.ie",
  "mailq.hse.ie",
  "mailr.hse.ie",
  "mails.hse.ie",
  "mailt.hse.ie",
  "mailv.hse.ie",
  "mail.vpn.gov.ie",
  "mailw.hse.ie",
  "mailx.hse.ie",
  "maily.hse.ie",
  "marine.gov.ie",
  "mercy-hospital-cork.ie",
  "mercyuniversityhospital.ie",
  "mhb.ie",
  "muh.ie",
  "mwhb.ie",
  "nrh.ie",
  "nwdoc.ie",
  "nwhb.ie",
  "oco.ie",
  "odao.ie",
  "oireachtas.ie",
  "oir.ie",
  "peerreview.gov.ie",
  "piab.ie",
  "injuriesboard.ie",
  "prai.ie",
  "president.ie",
  "prisons.ie",
  "probation.ie",
  "postannapoibli.ie",
  "reach.ie",
  "reachservices.ie",
  "registryofdeeds.ie",
  "revenue.ie",
  "reviewbody.gov.ie",
  "rogha.ie",
  "roscommon.brothersofcharity.ie",
  "sfpa.ie",
  "shb.ie",
  "shb.tv",
  "stjohnshospital.ie",
  "stmichaels.ie",
  "stpatricksmarymount.ie",
  "spmm.ie",
  "st-vincents.ie",
  "svhg.ie",
  "svuhg.ie",
  "svuh.ie",
  "taoiseach.ie",
  "tourism-sport.gov.ie",
  "udaras.ie",
  "welfare.ie",
  "dsfa.ie",
  "lcnhi.ie",
  "svph.ie",
  "groireland.ie",
  "ndp.ie",
  "pws.ie",
  "taxcommission.ie",
  "ntpf.ie",
  "nmh.ie",
  "mail.corkcity.ie",
  "lists.corkcity.ie",
  "external.corkcity.ie",
  "forasorganach.ie",
  "corkcorp.ie",
  "corkcitymarathon.ie",
  "corkcity.ie",
  "corkcitynow.ie",
  "sms.corkcity.ie",
  "leo.corkcity.ie",
  "droghedareview.ie",
  "coford.ie",
  "kerrylsp.ie",
  "ciarrai.ie",
  "kerrycoco.ie",
  "leo.kerrycoco.ie",
  "kerrycolib.ie",
  "kerrylibrary.ie",
  "kerryppn.ie",
  "killarneytc.ie",
  "killarneyudc.ie",
  "listoweltc.ie",
  "traleetc.ie",
  "tralee.ie",
  "pleanala.ie",
  "kerry.nrdo.ie",
  "merrionstreet.ie",
  "socialprotection.gov.ie",
  "kerryrecreationandsports.ie",
  "abp.ie",
  "bioethics.ie",
  "stabilitytreaty.ie",
  "countykerry.ie",
  "energycork.ie",
  "rebo.ie",
  "eu2013.ie",
  "pensionsombudsman.ie",
  "enterprise.gov.ie",
  "alab.ie",
  "peoplepoint.ie",
  "corkcitydevelopmentplan.ie",
  "iaemo.ie",
  "takingcareofbusiness.ie",
  "pointofsinglecontact.ie",
  "nacda.ie",
  "consumerconnect.ie",
  "deti.ie",
  "djei.ie",
  "dbei.ie",
  "entemp.ie",
  "labourcourt.ie",
  "nca.ie",
  "odce.ie",
  "patentsoffice.ie",
  "workplacerelations.ie",
  "lrc.ie",
  "employmentrights.ie",
  "equalitytribunal.ie",
  "symphysiotomyreview.ie",
  "itservices.gov.ie",
  "marymount.ie",
  "ogp.gov.ie",
  "corkceb.ie",
  "carsharing.ie",
  "locallink.ie",
  "localtransport.ie",
  "nationaltransport.ie",
  "smartertravelcampus.ie",
  "smartertravelworkplaces.ie",
  "swiftway.ie",
  "constitution.ie",
  "competitiveness.ie",
  "skillsireland.ie",
  "skillsireland.com",
  "skillsireland.net",
  "skillsireland.org",
  "sciencecouncil.ie",
  "taxireg.ie",
  "taxiregulator.ie",
  "cork.ie",
  "dacs.gov.ie",
  "corksmartgateway.ie",
  "corkbrand.ie",
  "corkcitycouncil.ie",
  "payment-scheme.gov.ie",
  "civildefence.ie",
  "agriappeals.gov.ie",
  "mbhcoi.ie",
  "corklgreview.ie",
  "corkcityparkbyphone.ie",
  "corklearningcity.ie",
  "cpsa.ie",
  "lobbying.ie",
  "mywelfare.ie",
  "mywelfare-nonprod.ie",
  "mygovid.ie",
  "mygovid-nonprod.ie",
  "forfas.ie",
  "srd.ie",
  "temp.srd.ie",
  "sspcrs.ie",
  "watergrant.ie",
  "water-grant.ie",
  "ocei.ie",
  "oic.ie",
  "ombudsman.ie",
  "sipo.ie",
  "cultureireland.ie",
  "www.cultureireland.ie",
  "iwish.ie",
  "activetravellogger.ie",
  "jobsireland.ie",
  "citizensassembly.ie",
  "welfarepartners.ie",
  "welfarepartners-nonprod.ie",
  "farrellycommission.gov.ie",
  "learningcities2017.org",
  "busconnects.ie",
  "finper.gov.ie",
  "drcd.gov.ie",
  "confidentialrecipient.gov.ie",
  "lowpaycommission.ie",
  "refcom.ie",
  "justicerenewal.ie",
  "irishgenealgoy.ie",
  "hicksoncommission.ie",
  "judiciary.ie",
  "ncse.ie",
  "ipoi.ie",
  "ipoi.gov.ie",
  "nsacommittee.gov.ie",
  "judicialcouncil.ie",
  "cervicalchecktribunal.ie",
  "cervicalchecktribunal.com",
  "corkinnovates.com",
  "egfsn.ie",
  "taxappeals.ie",
  "pensionscommission.gov.ie",
  "opr.ie",
  "environ.ie",
  "equality.gov.ie",
  "codf.gov.ie",
  "ihrec.ie",
  "wab.ie",
  "hoursbody.gov.ie",
  "tusla.ie",
  "climatetoolkit4business.gov.ie",
  "restorationoftrustmeetings.ie",
  "sfsi.ie",
  "pensionsauthority.ie",
  "pensionsboard.ie",
  "plf.ie",
  "housingcommission.gov.ie",
  "odf.ie",
  "irgdf.gov.ie",
  "electoralcommission.ie",
  "electoral-commission.ie",
  "dafmt.gov.ie",
  "policingauthority.ie",
  "drr.gov.ie",
  "transport.ie",
  "mcib.ie",
  "dttas.ie",
  "seafarers.ie",
  "safeseas.ie",
  "motortax.ie",
  "motarchain.ie",
  "motortrans.ie",
  "motorelv.ie",
  "aaiu.ie",
  "dait.ie",
  "ogciomt.gov.ie",
  "wildatlanticnature.gov.ie",
  "corncrakelife.gov.ie",
  "watersoflife.gov.ie",
  "lifeonmachair.gov.ie",
  "nda.ie",
  "eobdf.gov.ie",
  "opdc.ie",
  "valuationtribunal.ie",
  "ceud.ie",
  "growdigital.gov.ie",
  "agrifoodregulator.ie",
  "cro.ie",
  "toidf.ie",
];

type Props = {
  flowData: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
};

const status = (flowData: workflow.GetDigitalWallet) => {
  if (flowData.successfulAt) {
    return "approved";
  }

  if (flowData.rejectedAt) {
    return "rejected";
  }

  return "submitted";
};

export default async ({ userId, flow, flowData }: Props) => {
  const t = await getTranslations("Admin.GetDigitalWalletDetails");
  async function approveAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    const { appStoreEmail, deviceType, firstName, lastName } = flowData;

    try {
      await sendAppOnboardingEmail(
        appStoreEmail,
        firstName,
        lastName,
        deviceType as "ios" | "android",
      );
    } catch (error) {
      console.error(error);
    }

    await postgres.pgpool.query(
      `
            UPDATE user_flow_data set flow_data = flow_data || jsonb_build_object('successfulAt', now()::DATE::TEXT), updated_at = now()
            WHERE user_id=$1 AND flow = $2
        `,
      [userId, flow],
    );

    redirect("/admin");
  }

  async function reOpenAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    await postgres.pgpool.query(
      `
            UPDATE user_flow_data set flow_data = flow_data || jsonb_build_object('successfulAt', '', 'rejectedAt', '', 'submittedAt', '', 'status', 'pending', 'rejectReason', '', 'confirmedApplication', ''), updated_at = now()
            WHERE user_id=$1 AND flow = $2
        `,
      [userId, flow],
    );

    redirect("/admin");
  }

  const icon = INSTITUTIONAL_DOMAINS.find((d) =>
    flowData.govIEEmail.includes(`@${d}`),
  ) ? (
    <Icon icon="check-mark" color={ds.colours.ogcio.green} />
  ) : (
    <ExclamationMark />
  );
  return (
    <FormLayout
      action={{ slug: "submissions." + flow }}
      backHref={`/${routes.admin.slug}`}
      homeHref={`/${routes.admin.slug}`}
    >
      <div className="govie-heading-l">
        {t("title", { flow: t(flow).toLowerCase() })}
      </div>
      <div className="govie-heading-m">
        {flowData.firstName} {flowData.lastName}
      </div>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow
              item={{ key: t("firstName"), value: flowData.firstName }}
            />
            <ListRow
              item={{
                key: t("lastName"),
                value: flowData.lastName,
              }}
            />
            <ListRow
              item={{ key: t("myGovIdEmail"), value: flowData.myGovIdEmail }}
            />
            <ListRow
              item={{
                key: t("govIEEmail"),
                value: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {flowData.govIEEmail} {icon}
                  </div>
                ),
              }}
            />

            <ListRow
              item={{
                key: t("selectDeviceText"),
                value: t(flowData.deviceType?.toString()),
              }}
            />
            <ListRow
              item={{
                key: t(
                  flowData.deviceType === "ios"
                    ? "iosAppStoreEmail"
                    : "androidAppStoreEmail",
                ),
                value: flowData.appStoreEmail,
              }}
            />
            <ListRow
              item={{
                key: t("verifiedWorkEmail"),
                value: flowData.verifiedGovIEEmail ? t("yes") : t("no"),
              }}
            />
          </dl>
        </div>
      </div>

      {status(flowData) === "submitted" && (
        <form
          action={approveAction}
          style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
        >
          <input type="hidden" name="userId" defaultValue={userId} />
          <input type="hidden" name="flow" defaultValue={flow} />
          <Link
            className="govie-link"
            href={
              new URL(
                `${headers().get("x-pathname")}/reject`,
                process.env.HOST_URL,
              ).href
            }
          >
            {t("reject")}
          </Link>
          <button type="submit" className="govie-button govie-button--medium">
            {t("approve")}
          </button>
        </form>
      )}
      <form
        action={reOpenAction}
        style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
      >
        <input type="hidden" name="userId" defaultValue={userId} />
        <input type="hidden" name="flow" defaultValue={flow} />
        <button type="submit" className="govie-button govie-button--medium">
          {t("reopen")}
        </button>
      </form>
    </FormLayout>
  );
};
