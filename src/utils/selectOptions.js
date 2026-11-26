/**
 * Case-insensitive option search used by the searchable selects in the
 * manager session form.
 */
export function filterSelectOptions(options, query) {
  const term = String(query ?? '').trim().toLocaleLowerCase()

  if (!term) {
    return options
  }

  return options.filter((option) =>
    String(option.label ?? '')
      .toLocaleLowerCase()
      .includes(term)
  )
}
