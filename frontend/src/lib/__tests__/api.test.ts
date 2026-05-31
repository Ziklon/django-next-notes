import { api } from "@/lib/api";

const fetchMock = jest.fn();
// @ts-expect-error - assigning a mock to global fetch in the test env
global.fetch = fetchMock;

const ok = (body: unknown, status = 200) => ({
  ok: true,
  status,
  json: async () => body,
});

beforeEach(() => fetchMock.mockReset());

describe("api client", () => {
  it("listCategories unwraps the paginated results", async () => {
    fetchMock.mockResolvedValue(ok({ results: [{ id: 1 }] }));
    await expect(api.listCategories()).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/categories/"),
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("listNotes hits /notes/ with no query when no category", async () => {
    fetchMock.mockResolvedValue(ok({ results: [] }));
    await api.listNotes();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/notes\/$/);
  });

  it("listNotes adds ?category= when filtered", async () => {
    fetchMock.mockResolvedValue(ok({ results: [] }));
    await api.listNotes(3);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/notes\/\?category=3$/);
  });

  it("listNotes adds ?search= when a query is provided", async () => {
    fetchMock.mockResolvedValue(ok({ results: [] }));
    await api.listNotes(null, "meeting");
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/notes\/\?search=meeting$/);
  });

  it("listNotes combines category and search params", async () => {
    fetchMock.mockResolvedValue(ok({ results: [] }));
    await api.listNotes(2, "agenda");
    expect(fetchMock.mock.calls[0][0]).toMatch(/category=2/);
    expect(fetchMock.mock.calls[0][0]).toMatch(/search=agenda/);
  });

  it("retries the request with a refreshed token on 401", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce(ok({ access: "new-token" }))
      .mockResolvedValueOnce(ok({ results: [{ id: 99 }] }));

    document.cookie = "refresh_token=old-refresh; path=/";

    const result = await api.listNotes();
    expect(result).toEqual([{ id: 99 }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws and clears tokens when the refresh request itself fails", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });

    document.cookie = "refresh_token=bad-token; path=/";

    // Suppress the window.location assignment in jsdom
    const { location } = window;
    // @ts-expect-error – delete read-only property for test
    delete window.location;
    window.location = { ...location, href: "" } as Location;

    await expect(api.listNotes()).rejects.toThrow(/session expired/i);

    window.location = location;
  });

  it("handles a network error inside tryRefresh gracefully", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockRejectedValueOnce(new Error("network down"));

    document.cookie = "refresh_token=some-token; path=/";

    const { location } = window;
    // @ts-expect-error – delete read-only property for test
    delete window.location;
    window.location = { ...location, href: "" } as Location;

    await expect(api.listNotes()).rejects.toThrow();

    window.location = location;
  });

  it("createNote POSTs JSON", async () => {
    fetchMock.mockResolvedValue(ok({ id: 9 }));
    const data = { title: "a", content: "", category: null };
    await expect(api.createNote(data)).resolves.toEqual({ id: 9 });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(data);
  });

  it("updateNote PUTs to the id URL", async () => {
    fetchMock.mockResolvedValue(ok({ id: 9 }));
    await api.updateNote(9, { title: "a", content: "", category: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/notes\/9\/$/);
    expect(init.method).toBe("PUT");
  });

  it("deleteNote returns undefined on 204 without parsing a body", async () => {
    const json = jest.fn();
    fetchMock.mockResolvedValue({ ok: true, status: 204, json });
    await expect(api.deleteNote(9)).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("throws with the parsed error detail on a bad response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ title: ["bad"] }),
    });
    await expect(
      api.createNote({ title: "", content: "", category: null })
    ).rejects.toThrow(/bad/);
  });

  it("throws a generic message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });
    await expect(api.listCategories()).rejects.toThrow("Request failed (500)");
  });
});
