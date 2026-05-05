"use client";

import { useEffect, useState } from "react";
import { MenuData, Page } from "@/src/components/admin/Cms";
import { DashboardSection } from "@/src/components/admin/dashboard-section";
import { initialMenus, initialPages } from "@/src/components/admin/data";
import { MenusSection } from "@/src/components/admin/menus-section";
import { PagesSection } from "@/src/components/admin/pages/pages-section";
import { CategoryTable } from "@/src/components/admin/category/category-table";
import { PostsSection } from "@/src/components/admin/posts/PostSection";
import {
  GlobalCssSection,
  SettingsSection,
} from "@/src/components/admin/settings-section";
import { Sidebar } from "@/src/components/admin/AppSidebar";
import { TagTable } from "@/src/components/admin/tags/Tags";
import AdminSettings from "./setting/Page";
import { FooterSettingsSection } from "./FooterSettingSection";
import { MediaManager } from "../media-manager/MediaManager";

export function CMSAdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [menus, setMenus] = useState<MenuData[]>(initialMenus);

  useEffect(() => {
    localStorage.setItem("cms_pages", JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem("cms_menus", JSON.stringify(menus));
  }, [menus]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="flex-1 min-w-0 overflow-y-auto dot-grid p-2.5">
        {activeSection === "dashboard" && <DashboardSection />}
        {activeSection === "all-posts" && <PostsSection />}
        {activeSection === "all-media" && <MediaManager />}
        {activeSection === "categories" && (
          <div className="p-8">
            <CategoryTable />
          </div>
        )}
        {activeSection === "tags" && (
          <div className="p-8">
            <TagTable />
          </div>
        )}
        {activeSection === "pages" && (
          <PagesSection pages={pages} setPages={setPages} />
        )}
        {activeSection === "menus" && (
          <MenusSection menus={menus} setMenus={setMenus} pages={pages} />
        )}
        {activeSection === "footer-settings" && <FooterSettingsSection />}
        {activeSection === "settings" && <AdminSettings />}
        {activeSection === "global-css" && <GlobalCssSection />}
      </main>
    </div>
  );
}

<p>
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Et modi blanditiis ipsam a debitis perferendis velit, architecto magni quaerat consequuntur dicta, nam quo ut quasi omnis nesciunt veritatis quam, doloribus similique. Minima voluptate voluptatum, sunt voluptates architecto nisi excepturi ipsam labore dolorem fugiat recusandae vel, a ut unde placeat quisquam doloribus autem sapiente. Accusantium rem eligendi fugiat reiciendis tempore deserunt ipsa non officiis libero. Impedit, rem sunt, quae necessitatibus asperiores id ducimus voluptatem ipsam culpa dolor dignissimos. Odio optio, velit ratione cumque accusantium atque repellendus harum, eligendi voluptatum, reprehenderit neque ex quibusdam adipisci at. Expedita quas iusto officia obcaecati magni harum voluptate tenetur ipsa nihil quasi deserunt soluta non eum rerum incidunt laudantium id consequuntur at laborum, nulla minima nam et distinctio. Facere blanditiis ut autem ipsa iste qui nemo alias doloribus hic soluta, placeat velit numquam eaque voluptas dolor vero, nihil fugit dolores repellendus libero, harum ad. Culpa id, esse ullam nisi fugiat eius harum enim cupiditate incidunt modi saepe provident aliquam libero obcaecati pariatur cumque laboriosam rem quibusdam repellendus adipisci delectus consequuntur ipsam autem? Vero quia recusandae placeat, illum voluptatum eveniet repellat consequuntur harum ipsa corporis deleniti? Molestias distinctio, ad eveniet perspiciatis illo officia quibusdam nulla? Optio sapiente, assumenda asperiores, odio rem perspiciatis eaque eveniet ab ea nostrum laboriosam quis. Facere laboriosam cupiditate dolorum et aspernatur itaque quia temporibus cum voluptas tempora. Corporis, autem et impedit maiores asperiores officiis, molestiae distinctio ab architecto voluptatem tenetur deleniti. Repudiandae accusantium eius officia suscipit nam enim error doloribus sed velit porro nemo atque et dolore hic molestiae eos, aliquid omnis quibusdam fuga debitis eveniet reprehenderit inventore cumque? Voluptates, animi asperiores quae ullam quod necessitatibus officia, tempora quasi adipisci perferendis maxime, qui esse corrupti consequuntur odit dolorem quo blanditiis nihil nostrum dolorum libero suscipit vel? Possimus, debitis omnis sed itaque asperiores incidunt aut harum error dolore quia iusto odit quos adipisci deserunt optio quis facere est rerum. Rerum earum aut cum dolore culpa modi laboriosam omnis porro consectetur amet tempore officia, quibusdam enim aperiam aliquam consequuntur voluptatum harum nulla odio. Neque eius alias sit ipsa voluptatibus saepe mollitia, suscipit maiores in facilis exercitationem, sapiente nesciunt quia! Eos neque maiores facilis explicabo repellendus provident animi alias velit, modi magni consequatur non possimus? Tempora ea reprehenderit inventore officia nulla excepturi aliquid laboriosam commodi doloremque soluta possimus similique architecto, ipsam ullam eveniet! Ipsum, ipsam eveniet? Natus ut consectetur accusantium voluptate error asperiores at, delectus eum aliquid, incidunt earum saepe nobis, excepturi minus amet a iure esse. Beatae, fugit sapiente sed laboriosam dolore ullam laudantium eligendi in illo et expedita quaerat provident veritatis officia fugiat facere sit repellendus iure, ab non doloribus mollitia quae nam? Fugiat id voluptatibus doloribus mollitia architecto deserunt sunt repellat nesciunt totam suscipit, delectus at molestiae tempora accusantium, voluptate nihil ipsum, repellendus a? Ut placeat, explicabo commodi reprehenderit accusantium officiis fugit possimus minus. Debitis doloremque natus modi dolore, asperiores quia ullam quod in dignissimos pariatur incidunt sed nulla ea voluptatibus? Eius temporibus sapiente error, a earum corporis maxime. Quis reprehenderit corrupti ratione exercitationem voluptas velit quos, laboriosam non commodi eligendi aliquid aliquam esse ipsum laudantium id nam, dignissimos illo vel tempore quasi vitae voluptatum quae maxime! Quis ut nihil iusto distinctio aliquid ratione soluta necessitatibus culpa temporibus facilis tempora, aspernatur itaque molestias, inventore beatae nobis a vero, consectetur aliquam delectus eligendi. Velit quae similique quas quia excepturi error quasi cum! Possimus officia, facilis reiciendis fuga ad consequatur, officiis at perspiciatis eum dolorum laudantium atque inventore quisquam cupiditate repellat ipsum dolorem, repellendus non incidunt tempore. Necessitatibus rerum aut amet, iure, perferendis quis esse facere excepturi, itaque obcaecati provident assumenda saepe dignissimos placeat eum eos? Consectetur, asperiores cum in culpa corporis eligendi consequatur aspernatur eaque nobis, reiciendis autem? Exercitationem ullam, veniam soluta corrupti necessitatibus molestiae unde nemo, fuga in quasi magnam quaerat, voluptatem nobis quas saepe aliquid animi ut. Ea maiores, rem numquam quaerat nesciunt ut nisi ducimus ad sequi ratione, odit temporibus. Inventore maxime nemo, molestiae cum assumenda nam tempora debitis quis, animi, illo voluptas fugit non eligendi vero! Fugiat pariatur, numquam ad non nam mollitia maxime id exercitationem consequuntur, officia beatae deleniti modi aut adipisci consectetur veniam sunt animi inventore, vel unde porro! Enim eos nemo quia aliquid dicta dolorem cumque ipsum exercitationem soluta, ipsam hic optio neque laudantium. Totam dolorem officia nobis voluptatibus magni aspernatur qui? At consequuntur blanditiis porro cumque vero deleniti eaque omnis, nam quidem mollitia voluptates, provident enim, quisquam ratione! Unde, labore! Officiis laboriosam corporis voluptatibus quia officia? Eum perferendis magnam neque unde fuga obcaecati tempore eius illo! Odit dicta eius exercitationem. Delectus corrupti fuga praesentium hic. Est possimus tenetur laboriosam nihil accusantium cupiditate sed, cum velit dolores sint adipisci sapiente dignissimos necessitatibus rem ab eos totam ut reprehenderit illum consequatur deserunt animi, molestiae consequuntur similique. Aliquid sunt deserunt hic nobis perspiciatis quos? Dolore odit magni esse odio.
</p>