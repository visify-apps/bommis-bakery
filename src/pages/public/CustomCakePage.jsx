import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EnquiryProgress } from '../../components/customer/EnquiryProgress'
import {
  EnquiryStepContact,
  EnquiryStepDate,
  EnquiryStepFulfillment,
  EnquiryStepNeed,
  EnquiryStepOccasion,
  EnquiryStepProduct,
  EnquiryStepQuantity,
  EnquiryStepReference,
  EnquiryStepRequirements,
  EnquiryStepReview,
} from '../../components/customer/EnquirySteps'
import { useBusiness } from '../../context/BusinessContext'
import { useProduct } from '../../hooks/useCatalogue'
import { createEmptyEnquiryDraft } from '../../data/enquiryOptions'
import { buildDraftFromProduct, getEnquiryFlow } from '../../data/enquiryFlows'
import { createSubmissionToken, validateByStepId } from '../../utils/enquiry'
import { submitEnquiry } from '../../services/firestore/enquiries'
import { canAutoPrice, lineTotal, suggestedAdvance } from '../../utils/autoPrice'

function draftKey(productId) {
  return productId ? `ck_enquiry_draft_${productId}` : 'ck_enquiry_draft_custom'
}

function loadDraft(productId) {
  try {
    const raw = sessionStorage.getItem(draftKey(productId))
    if (!raw) return createEmptyEnquiryDraft()
    return { ...createEmptyEnquiryDraft(), ...JSON.parse(raw) }
  } catch {
    return createEmptyEnquiryDraft()
  }
}

export function CustomCakePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const productId = params.get('product')
  const { product, loading: productLoading } = useProduct(productId)
  const { business } = useBusiness()
  const minimumPreorderDays = business.minimumPreorderDays || 4

  const flow = useMemo(() => getEnquiryFlow(productId ? product : null), [productId, product])
  const steps = flow.steps

  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState(() => loadDraft(productId))
  const [referenceFile, setReferenceFile] = useState(null)
  const [stepError, setStepError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submissionTokenRef = useRef(createSubmissionToken())
  const productPrefillDone = useRef(false)

  // Reset draft when switching product vs custom
  useEffect(() => {
    setStepIndex(0)
    setDraft(loadDraft(productId))
    productPrefillDone.current = false
    submissionTokenRef.current = createSubmissionToken()
  }, [productId])

  const previewUrl = useMemo(() => {
    if (!referenceFile) return null
    return URL.createObjectURL(referenceFile)
  }, [referenceFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey(productId), JSON.stringify(draft))
    } catch {
      // ignore
    }
  }, [draft, productId])

  useEffect(() => {
    if (!product || productPrefillDone.current) return
    productPrefillDone.current = true
    setDraft((d) => {
      const next = buildDraftFromProduct(product, d)
      if (canAutoPrice(product) && next.servings) {
        const t = lineTotal(product.basePrice, next.servings)
        if (t != null) {
          const adv = suggestedAdvance(t)
          next.quotedPrice = t
          next.advanceRequired = adv
          next.balanceAmount = t - adv
          next.autoPriced = true
          next.priceLocked = true
        }
      }
      return next
    })
  }, [product])

  const currentStep = steps[stepIndex]

  function goNext() {
    const error = validateByStepId(currentStep.id, draft, {
      minimumPreorderDays,
      referenceFile,
      mode: flow.mode,
    })
    if (error) {
      setStepError(error)
      return
    }
    setStepError('')
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }

  function goBack() {
    setStepError('')
    setSubmitError('')
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  async function handleSubmit() {
    const error = validateByStepId('review', draft, {
      minimumPreorderDays,
      referenceFile,
      mode: flow.mode,
    })
    if (error) {
      setStepError(error)
      return
    }
    if (submitting) return

    setSubmitting(true)
    setStepError('')
    setSubmitError('')

    try {
      const result = await submitEnquiry({
        draft,
        referenceFile,
        submissionToken: submissionTokenRef.current,
        businessId: business.businessId,
      })
      try {
        sessionStorage.removeItem(draftKey(productId))
      } catch {
        // ignore
      }
      navigate(
        `/enquiry/success?enquiry=${encodeURIComponent(result.enquiryNumber)}&id=${encodeURIComponent(result.enquiryId)}${result.demo ? '&demo=1' : ''}`,
        { replace: true },
      )
    } catch (err) {
      setSubmitError(
        err?.message ||
          'Something went wrong while submitting your enquiry. Your information has not been confirmed. Please try again.',
      )
      submissionTokenRef.current = createSubmissionToken()
    } finally {
      setSubmitting(false)
    }
  }

  if (productId && productLoading) {
    return (
      <section className="page enquiry-page">
        <p className="muted">Loading product…</p>
      </section>
    )
  }

  if (productId && !productLoading && !product) {
    return (
      <section className="page enquiry-page">
        <h1>Product not found</h1>
        <p className="lede">This item may be unavailable.</p>
        <Link className="btn btn-primary" to="/menu">
          Back to menu
        </Link>
      </section>
    )
  }

  const stepProps = { draft, setDraft }

  return (
    <section className="page enquiry-page">
      <header className="page-header">
        <h1>{flow.title}</h1>
        <p className="lede">{flow.subtitle}</p>
      </header>

      <EnquiryProgress stepIndex={stepIndex} total={steps.length} labels={steps} />

      <div className="enquiry-panel">
        {currentStep.id === 'need' && <EnquiryStepNeed {...stepProps} />}
        {currentStep.id === 'product' && <EnquiryStepProduct product={product} />}
        {currentStep.id === 'occasion' && <EnquiryStepOccasion {...stepProps} />}
        {currentStep.id === 'requirements' && <EnquiryStepRequirements {...stepProps} />}
        {currentStep.id === 'quantity' && (
          <EnquiryStepQuantity {...stepProps} product={product} />
        )}
        {currentStep.id === 'reference' && (
          <EnquiryStepReference
            {...stepProps}
            referenceFile={referenceFile}
            setReferenceFile={setReferenceFile}
            previewUrl={previewUrl}
          />
        )}
        {currentStep.id === 'date' && (
          <EnquiryStepDate {...stepProps} minimumPreorderDays={minimumPreorderDays} />
        )}
        {currentStep.id === 'fulfillment' && <EnquiryStepFulfillment {...stepProps} />}
        {currentStep.id === 'contact' && <EnquiryStepContact {...stepProps} />}
        {currentStep.id === 'review' && (
          <EnquiryStepReview
            draft={draft}
            previewUrl={previewUrl}
            minimumPreorderDays={minimumPreorderDays}
          />
        )}

        {stepError ? <p className="form-error">{stepError}</p> : null}
        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="enquiry-actions">
          {stepIndex > 0 ? (
            <button type="button" className="btn btn-secondary" onClick={goBack} disabled={submitting}>
              Back
            </button>
          ) : (
            <Link className="btn btn-secondary" to={productId ? `/products/${productId}` : '/menu'}>
              Cancel
            </Link>
          )}

          {stepIndex < steps.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Enquiry'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
