import { RouterStoreNewPage } from './app.po';

describe('router-store-new App', () => {
  let page: RouterStoreNewPage;

  beforeEach(() => {
    page = new RouterStoreNewPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
