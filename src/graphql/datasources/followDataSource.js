import { DataSource } from "apollo-datasource";

class FollowAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models;
  }

  async getFollowedDesigners(userId) {
    return this.models.Follows.findAll({
      where: { userId },
      include: [
        {
          model: this.models.Designer,
          as: "designer",
          include: [{ model: this.models.DesignerInfo, as: "designer_info" }],
        },
      ],
    }).then((follows) => follows.map((follow) => follow.designer));
  }

  async isFollowing(userId, designerId) {
    const follow = await this.models.Follows.findOne({
      where: { userId, designerId },
    });
    return !!follow;
  }

  async followDesigner(userId, designerId) {
    return this.models.Follows.create({ userId, designerId });
  }

  async unfollowDesigner(userId, designerId) {
    const result = await this.models.Follows.destroy({
      where: { userId, designerId },
    });
    return result > 0;
  }
}

export default FollowAPI;
