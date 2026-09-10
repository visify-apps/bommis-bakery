import { OptionGrid } from './OptionGrid'
import {
  EGG_OPTIONS,
  FULFILLMENT_TYPES,
  OCCASIONS,
  REQUEST_TYPES,
} from '../../data/enquiryOptions'
import { formatDisplayDate, getMinPreferredDateISO } from '../../utils/enquiry'
import { canAutoPrice, lineTotal, suggestedAdvance } from '../../utils/autoPrice'

function Field({ label, children, hint }) {
  return (
    <label className="enquiry-field">
      <span>{label}</span>
      {children}
      {hint ? <small className="muted">{hint}</small> : null}
    </label>
  )
}

export function EnquiryStepNeed({ draft, setDraft }) {
  return (
    <div className="enquiry-step">
      <h2>What do you need?</h2>
      <OptionGrid
        name="Request type"
        options={REQUEST_TYPES}
        value={draft.requestType}
        onChange={(requestType) => setDraft((d) => ({ ...d, requestType }))}
      />
      {draft.requestType === 'Other' ? (
        <Field label="Describe what you need">
          <input
            value={draft.requestTypeOther}
            onChange={(e) => setDraft((d) => ({ ...d, requestTypeOther: e.target.value }))}
            placeholder="e.g. Cupcakes for a school event"
          />
        </Field>
      ) : null}
      {draft.productName ? (
        <p className="muted">Started from product: {draft.productName}</p>
      ) : null}
    </div>
  )
}

export function EnquiryStepProduct({ product }) {
  if (!product) {
    return (
      <div className="enquiry-step">
        <h2>Product</h2>
        <p className="muted">Loading product…</p>
      </div>
    )
  }
  const image = product.imageUrls?.[0]
  return (
    <div className="enquiry-step">
      <h2>You’re enquiring for</h2>
      <article className="product-enquiry-hero">
        <div className="product-enquiry-hero__media">
          {image ? (
            <img src={image} alt="" />
          ) : (
            <div className="product-card__placeholder" aria-hidden="true">
              <span>{product.name?.charAt(0)}</span>
            </div>
          )}
        </div>
        <div>
          <h3>{product.name}</h3>
          <p className="muted">{product.description}</p>
          {product.minimumQuantity ? (
            <p className="muted">Minimum order: {product.minimumQuantity}</p>
          ) : null}
        </div>
      </article>
      <p className="muted">Continue to add quantity, date, and your WhatsApp number.</p>
    </div>
  )
}

export function EnquiryStepQuantity({ draft, setDraft, product }) {
  const minQty = product?.minimumQuantity || 1
  const auto = canAutoPrice(product)
  const total = auto ? lineTotal(product.basePrice, draft.servings) : null

  function setQty(value) {
    setDraft((d) => {
      const next = { ...d, servings: value }
      if (canAutoPrice(product)) {
        const t = lineTotal(product.basePrice, value)
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
  }

  return (
    <div className="enquiry-step">
      <h2>How many?</h2>
      <div className="enquiry-fields">
        <Field
          label="Quantity"
          hint={product?.minimumQuantity ? `Minimum ${product.minimumQuantity}` : null}
        >
          <input
            inputMode="numeric"
            value={draft.servings}
            onChange={(e) => setQty(e.target.value)}
            placeholder={String(minQty)}
          />
        </Field>
        {auto && total != null ? (
          <p className="price-live">
            Estimated total: <strong>₹{total}</strong>
            <span className="muted"> (₹{product.basePrice} × {draft.servings || 0})</span>
          </p>
        ) : null}
        <Field label="Notes (optional)">
          <textarea
            rows={2}
            value={draft.otherRequirements}
            onChange={(e) => setDraft((d) => ({ ...d, otherRequirements: e.target.value }))}
            placeholder="Packaging, message, allergies…"
          />
        </Field>
      </div>
    </div>
  )
}

export function EnquiryStepOccasion({ draft, setDraft }) {
  return (
    <div className="enquiry-step">
      <h2>What’s the occasion?</h2>
      <OptionGrid
        name="Occasion"
        options={OCCASIONS}
        value={draft.occasion}
        onChange={(occasion) => setDraft((d) => ({ ...d, occasion }))}
      />
      {draft.occasion === 'Other' ? (
        <Field label="Describe the occasion">
          <input
            value={draft.occasionOther}
            onChange={(e) => setDraft((d) => ({ ...d, occasionOther: e.target.value }))}
          />
        </Field>
      ) : null}
    </div>
  )
}

export function EnquiryStepRequirements({ draft, setDraft }) {
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  return (
    <div className="enquiry-step">
      <h2>Cake requirements</h2>
      <p className="muted">Only fill what you know — nothing here is required.</p>
      <div className="enquiry-fields">
        <Field label="Cake size">
          <input value={draft.cakeSize} onChange={set('cakeSize')} placeholder="e.g. 1 kg / 6 inch" />
        </Field>
        <Field label="Servings (if known)">
          <input value={draft.servings} onChange={set('servings')} placeholder="e.g. 10–12" />
        </Field>
        <Field label="Flavour">
          <input value={draft.flavour} onChange={set('flavour')} placeholder="e.g. Chocolate Truffle" />
        </Field>
        <div className="enquiry-field">
          <span>Egg / Eggless</span>
          <OptionGrid
            name="Egg preference"
            options={EGG_OPTIONS}
            value={draft.eggPreference}
            onChange={(eggPreference) => setDraft((d) => ({ ...d, eggPreference }))}
          />
        </div>
        <Field label="Shape">
          <input value={draft.shape} onChange={set('shape')} placeholder="Round, heart, square…" />
        </Field>
        <Field label="Theme">
          <input value={draft.theme} onChange={set('theme')} placeholder="Barbie, butterfly, floral…" />
        </Field>
        <Field label="Colour preference">
          <input value={draft.colourPreference} onChange={set('colourPreference')} />
        </Field>
        <Field label="Text / name on cake">
          <input value={draft.messageOnCake} onChange={set('messageOnCake')} />
        </Field>
        <Field label="Age (if relevant)">
          <input value={draft.age} onChange={set('age')} />
        </Field>
        <Field label="Other requirements">
          <textarea
            rows={3}
            value={draft.otherRequirements}
            onChange={set('otherRequirements')}
            placeholder="Allergies, must-have details, inspiration notes…"
          />
        </Field>
      </div>
    </div>
  )
}

export function EnquiryStepReference({ draft, setDraft, referenceFile, setReferenceFile, previewUrl }) {
  return (
    <div className="enquiry-step">
      <h2>Reference / inspiration</h2>
      <p className="muted">
        Optional: pick a reference image (JPG, PNG, or WebP, max 5 MB). You can also send the photo on
        WhatsApp after submitting — that keeps the site on free Firebase services.
      </p>
      <Field label="Reference image (optional)">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            setReferenceFile(file)
          }}
        />
      </Field>
      {previewUrl ? (
        <div className="reference-preview">
          <img src={previewUrl} alt="Reference preview" />
          <button type="button" className="btn btn-ghost" onClick={() => setReferenceFile(null)}>
            Remove image
          </button>
        </div>
      ) : null}
      <Field label="Notes about the reference (optional)">
        <textarea
          rows={3}
          value={draft.referenceNotes}
          onChange={(e) => setDraft((d) => ({ ...d, referenceNotes: e.target.value }))}
          placeholder="What you like from this image…"
        />
      </Field>
    </div>
  )
}

export function EnquiryStepDate({ draft, setDraft, minimumPreorderDays }) {
  const minDate = getMinPreferredDateISO(minimumPreorderDays)
  return (
    <div className="enquiry-step">
      <h2>Preferred date</h2>
      <p className="muted">
        Please place enquiries at least {minimumPreorderDays}–5 days in advance.
      </p>
      <Field label="When do you need it?" hint={`Earliest: ${formatDisplayDate(minDate)}`}>
        <input
          type="date"
          min={minDate}
          value={draft.preferredDate}
          onChange={(e) => setDraft((d) => ({ ...d, preferredDate: e.target.value }))}
          required
        />
      </Field>
    </div>
  )
}

export function EnquiryStepFulfillment({ draft, setDraft }) {
  const setAddress = (key) => (e) =>
    setDraft((d) => ({
      ...d,
      deliveryAddress: { ...d.deliveryAddress, [key]: e.target.value },
    }))

  return (
    <div className="enquiry-step">
      <h2>Pickup or delivery</h2>
      <OptionGrid
        name="Fulfillment"
        options={FULFILLMENT_TYPES}
        value={draft.fulfillmentType}
        onChange={(fulfillmentType) => setDraft((d) => ({ ...d, fulfillmentType }))}
      />
      {draft.fulfillmentType === 'delivery' ? (
        <div className="enquiry-fields">
          <p className="muted">Delivery charges extra. Final delivery fee is confirmed by the baker.</p>
          <Field label="Address">
            <textarea
              rows={2}
              value={draft.deliveryAddress.address}
              onChange={setAddress('address')}
            />
          </Field>
          <Field label="Area">
            <input value={draft.deliveryAddress.area} onChange={setAddress('area')} />
          </Field>
          <Field label="Pincode">
            <input
              inputMode="numeric"
              value={draft.deliveryAddress.pincode}
              onChange={setAddress('pincode')}
              maxLength={6}
            />
          </Field>
          <Field label="Location notes (optional)">
            <input value={draft.deliveryAddress.notes} onChange={setAddress('notes')} />
          </Field>
        </div>
      ) : (
        <p className="muted">Self pickup is available. Exact pickup time will be confirmed on WhatsApp.</p>
      )}
    </div>
  )
}

export function EnquiryStepContact({ draft, setDraft }) {
  return (
    <div className="enquiry-step">
      <h2>Your details</h2>
      <p className="muted">WhatsApp is how the bakery will continue the conversation — no account needed.</p>
      <div className="enquiry-fields">
        <Field label="Name">
          <input
            value={draft.customerName}
            onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))}
            autoComplete="name"
            required
          />
        </Field>
        <Field label="WhatsApp phone" hint="10-digit Indian mobile">
          <input
            value={draft.customerPhone}
            onChange={(e) => setDraft((d) => ({ ...d, customerPhone: e.target.value }))}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </Field>
        <Field label="Email (optional)">
          <input
            type="email"
            value={draft.customerEmail}
            onChange={(e) => setDraft((d) => ({ ...d, customerEmail: e.target.value }))}
            autoComplete="email"
          />
        </Field>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  if (!value) return null
  return (
    <div className="review-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function EnquiryStepReview({ draft, previewUrl, minimumPreorderDays }) {
  return (
    <div className="enquiry-step">
      <h2>Review & submit</h2>
      <p className="muted">Check everything looks right, then submit your enquiry.</p>
      <dl className="review-list">
        <ReviewRow label="Need" value={draft.requestType === 'Other' ? draft.requestTypeOther : draft.requestType} />
        <ReviewRow label="Occasion" value={draft.occasion === 'Other' ? draft.occasionOther : draft.occasion} />
        <ReviewRow label="Size" value={draft.cakeSize} />
        <ReviewRow label="Servings" value={draft.servings} />
        <ReviewRow label="Flavour" value={draft.flavour} />
        <ReviewRow
          label="Egg / Eggless"
          value={EGG_OPTIONS.find((o) => o.value === draft.eggPreference)?.label || draft.eggPreference}
        />
        <ReviewRow label="Shape" value={draft.shape} />
        <ReviewRow label="Theme" value={draft.theme} />
        <ReviewRow label="Colours" value={draft.colourPreference} />
        <ReviewRow label="Message on cake" value={draft.messageOnCake} />
        <ReviewRow label="Age" value={draft.age} />
        <ReviewRow label="Other" value={draft.otherRequirements} />
        <ReviewRow label="Reference notes" value={draft.referenceNotes} />
        <ReviewRow label="Preferred date" value={formatDisplayDate(draft.preferredDate)} />
        <ReviewRow
          label="Fulfillment"
          value={
            draft.fulfillmentType === 'delivery'
              ? `Delivery · ${draft.deliveryAddress.area} · ${draft.deliveryAddress.pincode}`
              : 'Self pickup'
          }
        />
        {draft.fulfillmentType === 'delivery' ? (
          <ReviewRow label="Address" value={draft.deliveryAddress.address} />
        ) : null}
        <ReviewRow label="Name" value={draft.customerName} />
        <ReviewRow label="WhatsApp" value={draft.customerPhone} />
        <ReviewRow label="Email" value={draft.customerEmail} />
        {draft.productName ? <ReviewRow label="Product" value={draft.productName} /> : null}
        {draft.autoPriced && draft.quotedPrice != null ? (
          <ReviewRow label="Estimated total" value={`₹${draft.quotedPrice}`} />
        ) : null}
      </dl>
      {previewUrl ? (
        <div className="reference-preview">
          <img src={previewUrl} alt="Reference" />
        </div>
      ) : null}
      <p className="muted">
        Preorder: at least {minimumPreorderDays}–5 days · Delivery charges extra if delivery is selected.
      </p>
    </div>
  )
}
