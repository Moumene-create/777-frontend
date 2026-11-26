import { useEffect, useId, useRef, useState } from 'react'
import { filterSelectOptions } from '../utils/selectOptions'
import './SearchableSelect.css'

export default function SearchableSelect({
  id,
  value,
  options = [],
  onChange,
  placeholder = 'Select…',
  disabled = false,
  ariaLabelledBy,
  emptyMessage = 'No matches.',
}) {
  const generatedId = useId()
  const inputId = id ?? `searchable-select-${generatedId}`
  const listboxId = `${inputId}-listbox`
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(-1)

  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = filterSelectOptions(options, query)
  const displayValue = isOpen ? query : selectedOption?.label ?? ''
  const inputPlaceholder = selectedOption?.label ?? placeholder

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false)
        setQuery('')
        setHighlighted(-1)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  function close() {
    setIsOpen(false)
    setQuery('')
    setHighlighted(-1)
  }

  function open() {
    if (disabled) {
      return
    }

    const selectedIndex = options.findIndex((option) => option.value === value)
    setIsOpen(true)
    setQuery('')
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0)
  }

  function choose(option) {
    onChange(option.value)
    close()
    inputRef.current?.focus()
  }

  function handleChange(event) {
    const nextQuery = event.target.value
    const nextOptions = filterSelectOptions(options, nextQuery)

    setIsOpen(true)
    setQuery(nextQuery)
    setHighlighted(nextOptions.length > 0 ? 0 : -1)
  }

  function handleKeyDown(event) {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()

      if (!isOpen) {
        open()
        return
      }

      setHighlighted((current) =>
        Math.min(filteredOptions.length - 1, current + 1)
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      if (!isOpen) {
        open()
        return
      }

      setHighlighted((current) => Math.max(0, current - 1))
      return
    }

    if (event.key === 'Enter') {
      if (!isOpen) {
        event.preventDefault()
        open()
        return
      }

      if (highlighted >= 0 && filteredOptions[highlighted]) {
        event.preventDefault()
        choose(filteredOptions[highlighted])
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key === 'Tab') {
      close()
    }
  }

  return (
    <div
      ref={containerRef}
      className={`searchable-select${disabled ? ' searchable-select--disabled' : ''}`}
    >
      <input
        ref={inputRef}
        id={inputId}
        className="searchable-select__input"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          isOpen && highlighted >= 0
            ? `${listboxId}-option-${highlighted}`
            : undefined
        }
        aria-labelledby={ariaLabelledBy}
        autoComplete="off"
        spellCheck={false}
        value={displayValue}
        placeholder={inputPlaceholder}
        disabled={disabled}
        onFocus={open}
        onClick={() => {
          if (!isOpen) {
            open()
          }
        }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget)) {
            close()
          }
        }}
      />

      <span className="searchable-select__chevron" aria-hidden="true">
        ▾
      </span>

      {isOpen && (
        <ul
          className="searchable-select__listbox"
          id={listboxId}
          role="listbox"
          aria-labelledby={ariaLabelledBy}
          onMouseDown={(event) => event.preventDefault()}
        >
          {filteredOptions.length === 0 ? (
            <li className="searchable-select__empty">{emptyMessage}</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={`searchable-select__option${
                  index === highlighted
                    ? ' searchable-select__option--highlighted'
                    : ''
                }${
                  option.value === value
                    ? ' searchable-select__option--selected'
                    : ''
                }`}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(option)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
