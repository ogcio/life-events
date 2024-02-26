import { useTranslations } from "next-intl";

export default (props: { status: string }) => {
  const t = useTranslations("payments.Providers.status");  
  const { status } = props

  switch (status) {
    case "connected":
      return <strong className="govie-tag govie-tag--blue">{t('connected')}</strong>
    case "disconnected":
      return <strong className="govie-tag govie-tag--yellow">{t('disconnected')}</strong>
    default:
      return <strong className="govie-tag govie-tag--grey">{t('unknown')}</strong>
  }
}