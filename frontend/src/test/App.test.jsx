import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

const sampleRecipes = [
  {
    id: 1,
    name: 'Test Pancakes',
    cookTime: '15 minutes',
    ingredients: '2 cups flour\n2 eggs',
    instructions: 'Mix and fry.'
  }
]

const okResponse = (data) => ({ ok: true, json: async () => data })

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Recipe App', () => {
  it('renders the app title', async () => {
    fetch.mockResolvedValueOnce(okResponse([]))
    render(<App />)
    expect(screen.getByText(/Recipe Sharing App/)).toBeInTheDocument()
    await screen.findByText(/No recipes yet/)
  })

  it('shows recipes returned by the API', async () => {
    fetch.mockResolvedValueOnce(okResponse(sampleRecipes))
    render(<App />)
    expect(await screen.findByText('Test Pancakes')).toBeInTheDocument()
    expect(screen.getByText('All Recipes (1)')).toBeInTheDocument()
    expect(screen.getByText('2 cups flour')).toBeInTheDocument()
  })

  it('shows an empty message when there are no recipes', async () => {
    fetch.mockResolvedValueOnce(okResponse([]))
    render(<App />)
    expect(await screen.findByText(/No recipes yet/)).toBeInTheDocument()
    expect(screen.getByText('All Recipes (0)')).toBeInTheDocument()
  })

  it('does not crash when the API fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetch.mockRejectedValueOnce(new Error('Network error'))
    render(<App />)
    expect(await screen.findByText(/No recipes yet/)).toBeInTheDocument()
  })

  it('renders the add recipe form fields', async () => {
    fetch.mockResolvedValueOnce(okResponse([]))
    render(<App />)
    expect(screen.getByPlaceholderText('Recipe Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Cook Time/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ingredients/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Cooking Instructions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Recipe' })).toBeInTheDocument()
    await screen.findByText(/No recipes yet/)
  })

  it('sends a POST request when the form is submitted', async () => {
    fetch
      .mockResolvedValueOnce(okResponse([]))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse(sampleRecipes))

    const { container } = render(<App />)
    await screen.findByText(/No recipes yet/)

    fireEvent.change(screen.getByPlaceholderText('Recipe Name'), { target: { name: 'name', value: 'Test Pancakes' } })
    fireEvent.change(screen.getByPlaceholderText(/Cook Time/), { target: { name: 'cookTime', value: '15 minutes' } })
    fireEvent.change(screen.getByPlaceholderText(/Ingredients/), { target: { name: 'ingredients', value: '2 cups flour' } })
    fireEvent.change(screen.getByPlaceholderText('Cooking Instructions'), { target: { name: 'instructions', value: 'Mix and fry.' } })
    fireEvent.submit(container.querySelector('form'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes'),
        expect.objectContaining({ method: 'POST' })
      )
    })
    expect(await screen.findByText('Test Pancakes')).toBeInTheDocument()
  })
})
